import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  generateHash(data: string, salt?: string): string {
    const value = salt ? data + salt : data;

    return crypto.createHash('sha256').update(value).digest('hex');
  }

  generateSalt(): string {
    return crypto.randomBytes(16).toString('hex');
  }
}
