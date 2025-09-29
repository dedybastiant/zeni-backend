import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
  ConflictException,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import {
  CryptoService,
  LoggerService,
  TokenService,
} from 'src/common/services';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CheckPhoneNumberRequestDto,
  CheckPhoneNumberResponseData,
  CheckPhoneNumberResponseDto,
  EmailVerificationResponseDto,
  InputEmailRequestDto,
  InputNameRequestDto,
  InputNameResponseDto,
  InputPasscodeRequestDto,
  InputPasscodeResponseDto,
  InputPasswordRequestDto,
} from './dto/auth.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Prisma, RegistrationStep } from '@prisma/client';
import { RegistrationJwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { NotificationService } from 'src/notification/notification.service';
import { SendEmailVerificationRequestDto } from 'src/notification/dto/notification.dto';

interface VerificationData {
  phone_verified_at: string;
  email_verified_at: string;
}

interface Credentials {
  passcode_hash: string;
  password_hash: string;
}

interface Contacts {
  email_enc: string;
  phone_enc: string;
  email_hash: string;
  phone_hash: string;
}

interface RegistrationData {
  firstName: string;
  lastName: string;
  contacts: Contacts;
  credentials: Credentials;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cryptoService: CryptoService,
    private readonly tokenService: TokenService,
    private readonly notificationService: NotificationService,
    private readonly logger: LoggerService,
  ) {}

  async checkPhoneNumber(
    checkPhoneNumberRequestDto: CheckPhoneNumberRequestDto,
  ): Promise<CheckPhoneNumberResponseDto> {
    try {
      const { phoneNumber } = checkPhoneNumberRequestDto;
      const hashedPhoneNumber =
        this.cryptoService.generateHashForLookup(phoneNumber);

      this.logger.log(
        `Checking phone number: ${hashedPhoneNumber}`,
        AuthService.name,
      );

      const isRegistered = await this.prismaService.users.findFirst({
        where: { phone_hash: hashedPhoneNumber },
        select: { id: true, locked_until: true },
      });

      const currentDate = new Date();
      if (
        isRegistered &&
        isRegistered.locked_until != null &&
        isRegistered.locked_until > currentDate
      ) {
        throw new UnauthorizedException('account is locked');
      }

      this.logger.log(
        `Phone number ${hashedPhoneNumber} is ${
          isRegistered ? 'registered' : 'not registered'
        }`,
        AuthService.name,
      );

      const token = await this.tokenService.createTemporaryToken(phoneNumber);
      if (!token) {
        this.logger.error(
          `Failed to create token for phone number ${hashedPhoneNumber}`,
          AuthService.name,
        );
        throw new InternalServerErrorException('Failed to generate token');
      }

      this.logger.log(
        `Success create token for phone number ${hashedPhoneNumber}`,
        AuthService.name,
      );

      const dataDto = new CheckPhoneNumberResponseData();
      dataDto.isRegistered = !!isRegistered;

      if (!isRegistered) {
        dataDto.token = token;
      } else {
        dataDto.userId = isRegistered.id;
      }

      const resp = new CheckPhoneNumberResponseDto();
      resp.status = 'success';
      resp.message = 'phone number checked successfully';
      resp.data = dataDto;

      return resp;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        this.logger.error(`Error checking phone: ${error.message}`);
      } else {
        this.logger.error(`Error checking phone: ${error}`);
      }

      this.logger.error('Error checking phone');
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Unexpected error');
    }
  }

  async inputName(
    jwtPayload: RegistrationJwtPayload,
    inputNameRequestDto: InputNameRequestDto,
  ): Promise<InputNameResponseDto> {
    const { sub: phoneNumber } = jwtPayload;
    const { firstName, lastName } = inputNameRequestDto;

    const hashedPhoneNumber =
      this.cryptoService.generateHashForLookup(phoneNumber);

    const registrationSession =
      await this.prismaService.registrationSessions.findFirst({
        where: { phone_hash: hashedPhoneNumber },
        select: {
          id: true,
          verification_data: true,
          registration_data: true,
          next_step: true,
        },
      });

    if (!registrationSession) {
      throw new NotFoundException('session not found');
    }

    if (registrationSession.next_step !== RegistrationStep.NAME_INPUT) {
      throw new UnprocessableEntityException(
        `Expected step NAME_INPUT but got ${registrationSession.next_step}`,
      );
    }

    const currentRegistrationData = (registrationSession.registration_data ??
      {}) as Record<string, any>;
    const newRegistrationData: Prisma.JsonObject = {
      ...currentRegistrationData,
      firstName: firstName,
      lastName: lastName,
    };

    const nextStep = RegistrationStep.PASSCODE_INPUT;

    await this.prismaService.registrationSessions.update({
      where: { id: registrationSession.id },
      data: {
        registration_data: newRegistrationData,
        next_step: nextStep,
      },
    });

    const resp = new InputNameResponseDto();
    resp.status = 'succes';
    resp.message = 'name inputted successfully';
    resp.nextStep = nextStep;
    return resp;
  }

  async inputPasscode(
    jwtPayload: RegistrationJwtPayload,
    inputPasscodeRequestDto: InputPasscodeRequestDto,
  ): Promise<InputNameResponseDto> {
    const { sub: phoneNumber } = jwtPayload;
    const { passcode, confirmationPasscode } = inputPasscodeRequestDto;

    if (passcode !== confirmationPasscode) {
      throw new BadRequestException('invalid passcode confirmation');
    }

    const hashedPhoneNumber =
      this.cryptoService.generateHashForLookup(phoneNumber);

    const registrationSession =
      await this.prismaService.registrationSessions.findFirst({
        where: { phone_hash: hashedPhoneNumber },
        select: {
          id: true,
          verification_data: true,
          registration_data: true,
          next_step: true,
        },
      });

    if (!registrationSession) {
      throw new NotFoundException('session not found');
    }

    if (registrationSession.next_step !== RegistrationStep.PASSCODE_INPUT) {
      throw new UnprocessableEntityException(
        `Expected step PASSCODE_INPUT but got ${registrationSession.next_step}`,
      );
    }

    const hashedPasscode = this.cryptoService.generateHashForLookup(passcode);

    const currentRegistrationData = (registrationSession.registration_data ??
      {}) as Record<string, any>;
    const newRegistrationData: Prisma.JsonObject = {
      ...currentRegistrationData,
      credentials: { passcode_hash: hashedPasscode },
    };

    const nextStep = RegistrationStep.PASSWORD_INPUT;

    await this.prismaService.registrationSessions.update({
      where: { id: registrationSession.id },
      data: {
        registration_data: newRegistrationData,
        next_step: nextStep,
      },
    });

    const resp = new InputPasscodeResponseDto();
    resp.status = 'succes';
    resp.message = 'passcode inputted successfully';
    resp.nextStep = nextStep;
    return resp;
  }

  async inputPassword(
    jwtPayload: RegistrationJwtPayload,
    inputPasswordRequestDto: InputPasswordRequestDto,
  ): Promise<InputNameResponseDto> {
    const { sub: phoneNumber } = jwtPayload;
    const { password, confirmationPassword } = inputPasswordRequestDto;

    if (password !== confirmationPassword) {
      throw new BadRequestException('invalid password confirmation');
    }

    const hashedPhoneNumber =
      this.cryptoService.generateHashForLookup(phoneNumber);

    const registrationSession =
      await this.prismaService.registrationSessions.findFirst({
        where: { phone_hash: hashedPhoneNumber },
        select: {
          id: true,
          verification_data: true,
          registration_data: true,
          next_step: true,
        },
      });

    if (!registrationSession) {
      throw new NotFoundException('session not found');
    }

    if (registrationSession.next_step !== RegistrationStep.PASSWORD_INPUT) {
      throw new UnprocessableEntityException(
        `Expected step PASSWORD_INPUT but got ${registrationSession.next_step}`,
      );
    }

    const hashedPassword = this.cryptoService.generateHashForLookup(password);

    const currentRegistrationData = (registrationSession.registration_data ??
      {}) as Record<string, any>;

    const currentCredentials = (currentRegistrationData.credentials ??
      {}) as Record<string, any>;
    const newCredentials = { password_hash: hashedPassword };
    const updatedCredentials = { ...currentCredentials, ...newCredentials };

    const newRegistrationData: Prisma.JsonObject = {
      ...currentRegistrationData,
      credentials: updatedCredentials,
    };

    const nextStep = RegistrationStep.EMAIL_INPUT;

    await this.prismaService.registrationSessions.update({
      where: { id: registrationSession.id },
      data: {
        registration_data: newRegistrationData,
        next_step: nextStep,
      },
    });

    const resp = new InputPasscodeResponseDto();
    resp.status = 'succes';
    resp.message = 'password inputted successfully';
    resp.nextStep = nextStep;
    return resp;
  }

  async inputEmail(
    jwtPayload: RegistrationJwtPayload,
    inputEmailRequestDto: InputEmailRequestDto,
  ): Promise<InputNameResponseDto> {
    const { sub: phoneNumber } = jwtPayload;
    const { email } = inputEmailRequestDto;

    const hashedPhoneNumber =
      this.cryptoService.generateHashForLookup(phoneNumber);

    const registrationSession =
      await this.prismaService.registrationSessions.findFirst({
        where: { phone_hash: hashedPhoneNumber },
        select: {
          id: true,
          verification_data: true,
          registration_data: true,
          next_step: true,
        },
      });

    if (!registrationSession) {
      throw new NotFoundException('session not found');
    }

    if (registrationSession.next_step !== RegistrationStep.EMAIL_INPUT) {
      throw new UnprocessableEntityException(
        `Expected step EMAIL_INPUT but got ${registrationSession.next_step}`,
      );
    }

    const encryptedEmail = this.cryptoService.encryptEmail(email);
    const hashedEmail = this.cryptoService.generateHashForLookup(email);

    const isRegistered = await this.prismaService.users.findFirst({
      where: { email_hash: hashedEmail },
      select: { id: true },
    });

    if (isRegistered) {
      throw new ConflictException('email already registered');
    }

    const currentRegistrationData = (registrationSession.registration_data ??
      {}) as Record<string, any>;

    const currentContacts = (currentRegistrationData.contacts ?? {}) as Record<
      string,
      any
    >;
    const newContacts = { email_enc: encryptedEmail, email_hash: hashedEmail };
    const updatedContacts = { ...currentContacts, ...newContacts };

    const newRegistrationData: Prisma.JsonObject = {
      ...currentRegistrationData,
      contacts: updatedContacts,
    };

    const nextStep = RegistrationStep.EMAIL_VERIFY;

    await this.prismaService.registrationSessions.update({
      where: { id: registrationSession.id },
      data: {
        registration_data: newRegistrationData,
        next_step: nextStep,
      },
    });

    const verificationToken =
      this.cryptoService.generateVerificationEmailToken();

    const verificationRequest = new SendEmailVerificationRequestDto();
    verificationRequest.email = email;
    verificationRequest.token = verificationToken;

    await this.prismaService.emailVerificationChallenges.create({
      data: {
        phone_hash: hashedPhoneNumber,
        email_hash: hashedEmail,
        verification_token: verificationToken,
        expired_at: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    this.notificationService.sendEmailVerification(verificationRequest);

    const resp = new InputPasscodeResponseDto();
    resp.status = 'succes';
    resp.message = 'email inputted successfully';
    resp.nextStep = nextStep;
    return resp;
  }

  async emailVerification(token: string) {
    const verificationData =
      await this.prismaService.emailVerificationChallenges.findFirst({
        where: { verification_token: token },
        select: { id: true, phone_hash: true },
      });

    const session = await this.prismaService.registrationSessions.findFirst({
      where: { phone_hash: verificationData?.phone_hash },
      select: { id: true, verification_data: true },
    });

    const currentTime = new Date();

    const currentVerificationData = (session?.verification_data ||
      {}) as Record<string, any>;
    const newVerificationData = { email_verified_at: currentTime };
    const updatedVerificationData = {
      ...currentVerificationData,
      ...newVerificationData,
    };

    const updatedSession = await this.prismaService.registrationSessions.update(
      {
        where: { id: session?.id },
        data: {
          verification_data: updatedVerificationData,
          next_step: RegistrationStep.COMPLETED,
        },
        select: { id: true, verification_data: true, registration_data: true },
      },
    );

    const verification_data =
      updatedSession?.verification_data as unknown as VerificationData;

    const registration_data =
      updatedSession?.registration_data as unknown as RegistrationData;

    const registerUser = await this.prismaService.users.create({
      data: {
        first_name: registration_data.firstName,
        last_name: registration_data.lastName,
        email_enc: registration_data.contacts.email_enc,
        email_hash: registration_data.contacts.email_hash,
        phone_enc: registration_data.contacts.phone_enc,
        phone_hash: registration_data.contacts.phone_hash,
        password_hash: registration_data.credentials.password_hash,
        passcode_hash: registration_data.credentials.passcode_hash,
        phone_verified_at: verification_data.phone_verified_at,
        email_verified_at: verification_data.email_verified_at,
      },
      select: {
        phone_hash: true,
      },
    });

    const loginToken = await this.tokenService.createLoginToken(
      registerUser.phone_hash,
    );
    const resp = new EmailVerificationResponseDto();
    resp.status = 'success';
    resp.message = 'email verification success';
    resp.token = loginToken;
    return resp;
  }
}
