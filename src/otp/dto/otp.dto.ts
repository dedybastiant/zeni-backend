import { OtpChannel, OtpType, RegistrationStep } from '@prisma/client';
import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';

export class GenerateOtpRequestDto {
  @IsNumberString({}, { message: 'Phone number must contain only digits' })
  @IsDefined({ message: 'Phone number cannot be empty' })
  @IsNotEmpty({ message: 'Phone number cannot be empty' })
  phoneNumber: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'User ID must be a string' })
  @IsOptional()
  userId?: string;

  @IsDefined({ message: 'Channel cannot be empty' })
  @IsNotEmpty({ message: 'Channel cannot be empty' })
  @IsEnum(OtpChannel, { message: 'Invalid channel' })
  channel: OtpChannel;

  @IsDefined({ message: 'Type cannot be empty' })
  @IsNotEmpty({ message: 'Type cannot be empty' })
  @IsEnum(OtpType, { message: 'Invalid type' })
  type: OtpType;
}

export class GenerateOtpResponseDto extends BaseResponseDto {}

export class VerifyOtpRequestDto extends GenerateOtpRequestDto {
  @IsDefined({ message: 'OTP code cannot be empty' })
  @IsNotEmpty({ message: 'OTP code cannot be empty' })
  @IsNumberString({}, { message: 'OTP code must contain only digits' })
  otpCode: string;
}

export class VerifyOtpResponseDto extends BaseResponseDto {
  @IsEnum(RegistrationStep, { message: 'Invalid Next step' })
  nextStep: string;

  @IsString({ message: 'Token must be a string' })
  token: string;
}
