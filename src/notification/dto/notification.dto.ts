import { OtpChannel, OtpType } from '@prisma/client';

export class SendOtpRequestDto {
  phoneNumber: string;
  email?: string;
  code: string;
  channel: OtpChannel;
  type: OtpType;
}
