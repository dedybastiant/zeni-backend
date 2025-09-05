import { Module } from '@nestjs/common';
import { CryptoService } from './services';

@Module({
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CommonModule {}
