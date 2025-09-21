import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { CommonModule } from 'src/common/common.module';
import { RedisModule } from 'src/common/redis/redis.module';
import { NotificationModule } from 'src/notification/notification.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [CommonModule, RedisModule, NotificationModule, PrismaModule],
  providers: [OtpService],
  controllers: [OtpController],
})
export class OtpModule {}
