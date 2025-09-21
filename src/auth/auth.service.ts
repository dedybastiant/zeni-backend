import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CryptoService, LoggerService } from 'src/common/services';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CheckPhoneNumberRequestDto,
  CheckPhoneNumberResponseData,
  CheckPhoneNumberResponseDto,
} from './dto/auth.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';

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
}
