import { Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
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
