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
