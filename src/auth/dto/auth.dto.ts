import { Expose } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsNumberString, Length } from 'class-validator';
import { BaseResponseDto } from 'src/common/dto/response.dto';

export class CheckPhoneNumberDto {
  @Expose({ name: 'phone_number' })
  @IsNumberString({}, { message: 'Phone number must contain only digits' })
  @IsDefined({ message: 'Phone number cannot be empty' })
  @IsNotEmpty({ message: 'Phone number cannot be empty' })
  @Length(10, 15, { message: 'Phone number must be between 10 and 15 digits' })
  phoneNumber: string;
}

export class CheckPhoneDataDto {
  is_registered: boolean;
}

export class CheckPhoneResponseDto extends BaseResponseDto {
  data: CheckPhoneDataDto;
}
