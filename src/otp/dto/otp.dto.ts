import { OtpChannel, OtpType } from '@prisma/client';
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
