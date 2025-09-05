import { Expose } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsNumberString } from 'class-validator';
import { BaseResponseDto } from 'src/common/dto/response.dto';

export class CheckPhoneNumberDto {
  @Expose({ name: 'phone_number' })
  @IsNumberString({}, { message: 'Phone number must contain only digits' })
  @IsDefined({ message: 'Phone number cannot be empty' })
  @IsNotEmpty({ message: 'Phone number cannot be empty' })
  phoneNumber: string;
}

export class CheckPhoneDataDto {
  is_registered: boolean;
}

export class CheckPhoneResponseDto extends BaseResponseDto {
  data: CheckPhoneDataDto;
}
