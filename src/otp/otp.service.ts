import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RedisService } from 'src/common/redis/redis.service';
import { CryptoService, LoggerService } from 'src/common/services';
import { NotificationService } from 'src/notification/notification.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  GenerateOtpRequestDto,
  GenerateOtpResponseDto,
  VerifyOtpRequestDto,
  VerifyOtpResponseDto,
} from './dto/otp.dto';
import { OtpChannel, OtpType, Prisma, RegistrationStep } from '@prisma/client';
import { SendOtpRequestDto } from 'src/notification/dto/notification.dto';

@Injectable()
export class OtpService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cryptoService: CryptoService,
    private readonly redisService: RedisService,
    private readonly notificationService: NotificationService,
    private readonly logger: LoggerService,
  ) {}

  private generateRandomNumber(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async generateOtp(requestOtp: GenerateOtpRequestDto) {
    const type = requestOtp.type;

    if (type !== OtpType.REGISTER && !requestOtp.userId) {
      throw new BadRequestException('user id is required for this otp type');
    }

    const phoneNumber = requestOtp.phoneNumber;
    const channel = requestOtp.channel;

    const hashedPhoneNumber =
      this.cryptoService.generateHashForLookup(phoneNumber);

    this.logger.log(
      `Generating OTP for phone: ${hashedPhoneNumber}, type: ${type}, channel: ${channel}`,
      OtpService.name,
    );

    const count = await this.redisService.getOtpCounter(
      phoneNumber,
      type,
      channel,
    );

    if (count && +count >= 5) {
      throw new BadRequestException(
        'otp request limit reached, try again later',
      );
    }

    const otpCode = this.generateRandomNumber();
    const otpCodeSalt = this.cryptoService.generateSalt();
    const hashedOtpCode = this.cryptoService.generateSecureHash(
      otpCode,
      otpCodeSalt,
    );

    let hashedEmail: string | null = null;

    if (requestOtp.email) {
      hashedEmail = this.cryptoService.generateHashForLookup(requestOtp.email);
    }

    if (requestOtp.userId) {
      const userExists = await this.prismaService.users.findUnique({
        where: { id: requestOtp.userId, phone_hash: hashedPhoneNumber },
        select: { id: true },
      });

      if (!userExists) {
        throw new NotFoundException('user not found');
      }
    }

    await this.prismaService.otpChallenges.create({
      data: {
        user_id: requestOtp.userId || null,
        phone_hash: hashedPhoneNumber,
        email_hash: hashedEmail,
        channel: requestOtp.channel,
        type: requestOtp.type,
        code_hash: hashedOtpCode,
        code_salt: otpCodeSalt,
        expired_at: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    await this.redisService.incrementOtpCounter(phoneNumber, type, channel);

    const sendOtp: SendOtpRequestDto = {
      phoneNumber: requestOtp.phoneNumber,
      email: requestOtp.email,
      channel: requestOtp.channel,
      type: requestOtp.type,
      code: otpCode,
    };

    this.notificationService.sendOtp(sendOtp);

    const resp = new GenerateOtpResponseDto();
    resp.status = 'success';
    resp.message = 'otp generated and sent successfully';

    return resp;
  }

  async verifyOtp(requestVerifyOtp: VerifyOtpRequestDto) {
    const { channel, type, email, phoneNumber, otpCode } = requestVerifyOtp;

    if (channel === OtpChannel.EMAIL && !email) {
      throw new BadRequestException(
        'email is required for email otp verification',
      );
    }

    const hashedPhoneNumber =
      this.cryptoService.generateHashForLookup(phoneNumber);
    let hashedEmail: string | undefined;

    if (email) {
      hashedEmail = this.cryptoService.generateHashForLookup(email);
    }

    const whereClause: Prisma.OtpChallengesWhereInput = {
      type,
      channel,
      phone_hash: hashedPhoneNumber,
      is_consumed: false,
    };

    if (channel === OtpChannel.EMAIL && hashedEmail) {
      whereClause.email_hash = hashedEmail;
    }

    const currentDate = new Date();

    await this.prismaService.$transaction<void>(
      async (prisma: Prisma.TransactionClient) => {
        const otpRecord = await prisma.otpChallenges.findFirst({
          where: whereClause,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            code_hash: true,
            code_salt: true,
            expired_at: true,
            is_consumed: true,
          },
        });

        if (!otpRecord) {
          throw new NotFoundException('otp data not found');
        }

        if (otpRecord.is_consumed) {
          throw new UnauthorizedException('otp has already been used');
        }

        if (otpRecord.expired_at && otpRecord.expired_at < new Date()) {
          throw new UnauthorizedException('otp has expired');
        }

        const hashedOtp = this.cryptoService.generateSecureHash(
          otpCode,
          otpRecord.code_salt,
        );

        if (hashedOtp !== otpRecord.code_hash) {
          throw new UnauthorizedException('invalid otp');
        }

        await prisma.otpChallenges.update({
          where: { id: otpRecord.id },
          data: {
            is_consumed: true,
            consumed_at: currentDate,
          },
        });
      },
    );

    const resp = new VerifyOtpResponseDto();

    const registrationSession =
      await this.prismaService.registrationSessions.findFirst({
        where: { phone_hash: hashedPhoneNumber },
        select: { id: true, verification_data: true, next_step: true },
      });

    if (registrationSession) {
      const nextStep = registrationSession?.next_step;
      resp.status = 'success';
      resp.message = 'phone number already verified successfully';
      resp.nextStep = nextStep;
      return resp;
    }

    const encryptedPhoneNumber = this.cryptoService.encryptPhone(phoneNumber);

    const registrationStep =
      await this.prismaService.registrationSessions.create({
        data: {
          phone_enc: encryptedPhoneNumber,
          phone_hash: hashedPhoneNumber,
          verification_data: {
            phone_verified_at: currentDate,
          },
          registration_data: {
            contacts: {
              phone_enc: encryptedPhoneNumber,
              phone_hash: hashedPhoneNumber,
            },
          },
          next_step: RegistrationStep.NAME_INPUT,
          expires_at: new Date(Date.now() + 15 * 3600 * 1000),
        },
        select: { id: true, next_step: true },
      });

    resp.status = 'success';
    resp.message = 'phone number verified successfully';
    resp.nextStep = registrationStep.next_step;

    return resp;
  }
}
