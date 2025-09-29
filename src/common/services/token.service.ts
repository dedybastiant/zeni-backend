import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async createTemporaryToken(phoneNumber: string) {
    return this.jwtService.signAsync(
      { sub: phoneNumber, type: 'registration' },
      { expiresIn: '10m' },
    );
  }

  async createLoginToken(phoneNumber: string) {
    return this.jwtService.signAsync(
      { sub: phoneNumber, type: 'login' },
      { expiresIn: '10m' },
    );
  }
}
