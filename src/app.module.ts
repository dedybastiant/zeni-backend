import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [AuthModule, PrismaModule, CommonModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
