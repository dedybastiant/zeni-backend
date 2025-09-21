import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CheckPhoneNumberRequestDto } from './dto/auth.dto';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/check-phone')
  async checkPhoneNumberStatus(
    @Body() checkPhoneNumberRequestDto: CheckPhoneNumberRequestDto,
  ) {
    return this.authService.checkPhoneNumber(checkPhoneNumberRequestDto);
  }
}
