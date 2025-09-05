import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  generateSecureHash(data: string, salt: string): string {
    return crypto
      .createHash('sha256')
      .update(data + salt)
      .digest('hex');
  }

  generateHashForLookup(data: string): string {
    const pepper = process.env.CRYPTO_PEPPER || 'default-pepper';
    return crypto
      .createHash('sha256')
      .update(data + pepper)
      .digest('hex');
  }

  generateSalt(): string {
    return crypto.randomBytes(16).toString('hex');
  }
}
