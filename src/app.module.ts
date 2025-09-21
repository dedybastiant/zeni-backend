import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { NotificationModule } from './notification/notification.module';
import { OtpModule } from './otp/otp.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    CommonModule,
    NotificationModule,
    OtpModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
