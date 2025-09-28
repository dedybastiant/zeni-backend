import { Module } from '@nestjs/common';
import { CryptoService, LoggerService, TokenService } from './services';

@Module({
  providers: [CryptoService, LoggerService, TokenService],
  exports: [CryptoService, LoggerService, TokenService],
})
export class CommonModule {}
