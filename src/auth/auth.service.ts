import { Injectable } from '@nestjs/common';
import { CryptoService } from 'src/common/services';
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckPhoneResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cryptoService: CryptoService,
  ) {}

  async checkPhoneNumberStatus(
    phoneNumber: string,
  ): Promise<CheckPhoneResponseDto> {
    try {
      const phoneHash = this.cryptoService.generateHashForLookup(phoneNumber);

      const isRegistered = await this.prismaService.users.findUnique({
        where: { phone_hash: phoneHash },
      });

      return {
        status: 'success',
        message: 'success to check phone number',
        data: { is_registered: !!isRegistered },
      };
    } catch (error) {
      console.error('Error checking phone:', error);
      throw new Error('Failed to check phone registration');
    }
  }
}
