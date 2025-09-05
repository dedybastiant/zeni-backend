import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CheckPhoneNumberDto } from './dto/auth.dto';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('check-phone')
  async checkPhoneNumberStatus(
    @Body() checkPhoneNumberDto: CheckPhoneNumberDto,
  ) {
    return this.authService.checkPhoneNumberStatus(
      checkPhoneNumberDto.phoneNumber,
    );
  }
}
