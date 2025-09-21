import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RedisService } from 'src/common/redis/redis.service';
import { CryptoService, LoggerService } from 'src/common/services';
import { NotificationService } from 'src/notification/notification.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateOtpRequestDto, GenerateOtpResponseDto } from './dto/otp.dto';
import { OtpType } from '@prisma/client';
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
}
