import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly encryptionKey: Buffer;

  constructor() {
    if (!process.env.CRYPTO_KEY) {
      throw new Error('CRYPTO_KEY env var is required');
    }
    this.encryptionKey = Buffer.from(process.env.CRYPTO_KEY, 'hex');
  }

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

  encrypt(data: string): string {
    try {
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv(
        this.algorithm,
        this.encryptionKey,
        iv,
      );

      let encrypted = cipher.update(data, 'utf8');
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      const tag = cipher.getAuthTag();

      return Buffer.concat([iv, tag, encrypted]).toString('base64');
    } catch (error) {
      throw new Error(
        `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  decrypt(encryptedData: string): string {
    try {
      const buffer = Buffer.from(encryptedData, 'base64');

      if (buffer.length < 28) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = buffer.slice(0, 12);
      const tag = buffer.slice(12, 28);
      const encrypted = buffer.slice(28);

      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.encryptionKey,
        iv,
      );
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return decrypted.toString('utf8');
    } catch (error) {
      throw new Error(
        `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  encryptPhone(phone: string): string {
    return this.encrypt(phone);
  }

  decryptPhone(encryptedPhone: string): string {
    return this.decrypt(encryptedPhone);
  }

  encryptEmail(email: string): string {
    return this.encrypt(email);
  }

  decryptEmail(encryptedEmail: string): string {
    return this.decrypt(encryptedEmail);
  }
}
