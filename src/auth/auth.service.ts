import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CryptoService, LoggerService } from 'src/common/services';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CheckPhoneNumberRequestDto,
  CheckPhoneNumberResponseData,
  CheckPhoneNumberResponseDto,
  InputNameRequestDto,
  InputNameResponseDto,
  InputPasscodeRequestDto,
  InputPasscodeResponseDto,
} from './dto/auth.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { Prisma, RegistrationStep } from '@prisma/client';
import { RegistrationJwtPayload } from 'src/common/interfaces/registration-jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
  ) {}

  async createTemporaryToken(phoneNumber: string) {
    return this.jwtService.signAsync(
      { sub: phoneNumber, type: 'registration' },
      { expiresIn: '10m' },
    );
  }

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
        select: { id: true },
      });

      this.logger.log(
        `Phone number ${hashedPhoneNumber} is ${
          isRegistered ? 'registered' : 'not registered'
        }`,
        AuthService.name,
      );

      const token = await this.createTemporaryToken(phoneNumber);

      if (!token) {
        this.logger.error(
          `Failed to create token for phone number ${hashedPhoneNumber}`,
          AuthService.name,
        );
        throw new Error('Failed to generate token');
      }

      this.logger.log(
        `Success create token for phone number ${hashedPhoneNumber}`,
        AuthService.name,
      );

      const dataDto = new CheckPhoneNumberResponseData();
      dataDto.isRegistered = !!isRegistered;
      dataDto.token = token;

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

      throw new InternalServerErrorException(
        'Failed to check phone registration',
      );
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

    const currentRegistrationData = (registrationSession.registration_data ??
      {}) as Record<string, any>;
    const newRegistrationData: Prisma.JsonObject = {
      ...currentRegistrationData,
      credentials: { passcode: passcode },
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
}
