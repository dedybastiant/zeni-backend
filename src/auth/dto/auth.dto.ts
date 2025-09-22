import { RegistrationStep } from '@prisma/client';
import { Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';

export class CheckPhoneNumberRequestDto {
  @IsNumberString({}, { message: 'Phone number must contain only digits' })
  @IsDefined({ message: 'Phone number is required' })
  @IsNotEmpty({ message: 'Phone number cannot be blank' })
  @Length(10, 13, {
    message: 'Phone number must be between 10 and 13 digits long',
  })
  phoneNumber: string;
}

export class CheckPhoneNumberResponseData {
  @IsDefined({ message: 'Is Registered cannot be empty' })
  @IsBoolean({ message: 'Is Registered should be a boolean' })
  isRegistered: boolean;

  @Expose({ name: 'token' })
  @IsDefined({ message: 'Token cannot be empty' })
  @IsString({ message: 'Token should be a string' })
  token: string;
}

export class CheckPhoneNumberResponseDto extends BaseResponseDto {
  @Type(() => CheckPhoneNumberResponseData)
  data: CheckPhoneNumberResponseData;
}

export class InputNameRequestDto {
  @IsDefined({ message: 'First name is required' })
  @IsNotEmpty({ message: 'First name cannot be blank' })
  @IsString({ message: 'First name should be a string' })
  @Length(3, 32, { message: 'First name must be between 3 and 32 digits long' })
  firstName: string;

  @IsDefined({ message: 'Last name is required' })
  @IsNotEmpty({ message: 'Last name cannot be blank' })
  @IsString({ message: 'Last name should be a string' })
  @Length(3, 32, { message: 'Last name must be between 3 and 32 digits long' })
  lastName: string;
}

export class InputNameResponseDto extends BaseResponseDto {
  @IsEnum(RegistrationStep, { message: 'Invalid next step' })
  nextStep: string;
}

export class InputPasscodeRequestDto {
  @IsDefined({ message: 'Passcode is required' })
  @IsNotEmpty({ message: 'Passcode cannot be blank' })
  @IsString({ message: 'Passcode should be a string' })
  @Length(6, 6, { message: 'Passcode must be 6 digits long' })
  passcode: string;

  @IsDefined({ message: 'Passcode is required' })
  @IsNotEmpty({ message: 'Passcode cannot be blank' })
  @IsString({ message: 'Passcode should be a string' })
  @Length(6, 6, { message: 'Passcode must be 6 digits long' })
  confirmationPasscode: string;
}

export class InputPasscodeResponseDto extends BaseResponseDto {
  @IsEnum(RegistrationStep, { message: 'Invalid next step' })
  nextStep: string;
}

export class InputPasswordRequestDto {
  @IsDefined({ message: 'Password is required' })
  @IsNotEmpty({ message: 'Password cannot be blank' })
  @IsString({ message: 'Password should be a string' })
  @Length(8, 32, { message: 'Password must be 6 digits long' })
  @Matches(/(?=.*[a-z])/, {
    message: 'Password must have at least one lowercase letter',
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must have at least one uppercase letter',
  })
  @Matches(/(?=.*[0-9])/, {
    message: 'Password must have at least a digits',
  })
  @Matches(/(?=.*[!@#$%^&*])/, {
    message: 'Password must have at least one special character',
  })
  @Matches(/^\S*$/, { message: 'Password cannot contain space' })
  password: string;

  @IsDefined({ message: 'Confirmation password is required' })
  @IsNotEmpty({ message: 'Confirmation password cannot be blank' })
  @IsString({ message: 'Confirmation password should be a string' })
  @Length(8, 32, { message: 'Confirmation password must be 6 digits long' })
  @Matches(/(?=.*[a-z])/, {
    message: 'Confirmation password must have at least one lowercase letter',
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Confirmation password must have at least one uppercase letter',
  })
  @Matches(/(?=.*[0-9])/, {
    message: 'Confirmation password must have at least a digits',
  })
  @Matches(/(?=.*[!@#$%^&*])/, {
    message: 'Confirmation password must have at least one special character',
  })
  @Matches(/^\S*$/, { message: 'Confirmation password cannot contain space' })
  confirmationPassword: string;
}

export class InputPasswordResponseDto extends BaseResponseDto {
  @IsEnum(RegistrationStep, { message: 'Invalid next step' })
  nextStep: string;
}
