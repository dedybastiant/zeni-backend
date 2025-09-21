import { Module } from '@nestjs/common';
import { CryptoService, LoggerService } from './services';

@Module({
  providers: [CryptoService, LoggerService],
  exports: [CryptoService, LoggerService],
})
export class CommonModule {}
