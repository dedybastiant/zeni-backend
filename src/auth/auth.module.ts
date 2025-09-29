import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CommonModule } from 'src/common/common.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [PrismaModule, CommonModule, NotificationModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
