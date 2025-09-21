import { Injectable } from '@nestjs/common';
import { OtpChannel, OtpType } from '@prisma/client';
import { LoggerService } from 'src/common/services';
import { SendOtpRequestDto } from './dto/notification.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly logger: LoggerService) {}
  private sendOtpEmail(email: string, code: string, type: OtpType) {
    console.log('send email', email, code, type);
  }

  private sendOtpSms(phone: string, code: string, type: OtpType) {
    console.log('send sms', phone, code, type);
  }

  private sendOtpWhatsapp(phone: string, code: string, type: OtpType) {
    console.log('send whatsapp', phone, code, type);
  }

  sendOtp(sendOtpData: SendOtpRequestDto): void {
    const otpChannel = sendOtpData.channel;

    switch (otpChannel) {
      case OtpChannel.EMAIL:
        this.logger.log(`Send otp via email`, NotificationService.name);

        this.sendOtpEmail(
          sendOtpData.email!,
          sendOtpData.code,
          sendOtpData.type,
        );
        break;
      case OtpChannel.WHATSAPP:
        this.logger.log(`Send otp via whatsapp`, NotificationService.name);

        this.sendOtpWhatsapp(
          sendOtpData.phoneNumber,
          sendOtpData.code,
          sendOtpData.type,
        );
        break;
      case OtpChannel.SMS:
        this.logger.log(`Send otp via sms`, NotificationService.name);

        this.sendOtpSms(
          sendOtpData.phoneNumber,
          sendOtpData.code,
          sendOtpData.type,
        );
        break;
    }
  }
}
