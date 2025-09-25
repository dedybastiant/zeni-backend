import { OtpChannel, OtpType } from '@prisma/client';
import { IsDefined, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';

export class SendOtpRequestDto {
  phoneNumber: string;
  email?: string;
  code: string;
  channel: OtpChannel;
  type: OtpType;
}

export class SendEmailVerificationRequestDto {
  @IsDefined({ message: 'Email is required' })
  @IsNotEmpty({ message: 'Email cannot be blank' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsDefined({ message: 'Token is required' })
  @IsNotEmpty({ message: 'Token cannot be blank' })
  @IsString({ message: 'Token should be a string' })
  token: string;
}

export class SendEmailVerificationResponseDto extends BaseResponseDto {}
