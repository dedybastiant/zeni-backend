import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
