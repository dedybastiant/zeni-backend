import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CheckPhoneNumberRequestDto,
  InputNameRequestDto,
  InputPasscodeRequestDto,
} from './dto/auth.dto';
import { RegistrationPayload } from 'src/common/decorators/registration-payload.decorator';
import { RegistrationTokenGuard } from 'src/common/guards/registration-token.guard';
import type { RegistrationJwtPayload } from 'src/common/interfaces/registration-jwt-payload.interface';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/check-phone')
  async checkPhoneNumberStatus(
    @Body() checkPhoneNumberRequestDto: CheckPhoneNumberRequestDto,
  ) {
    return this.authService.checkPhoneNumber(checkPhoneNumberRequestDto);
  }

  @UseGuards(RegistrationTokenGuard)
  @Post('/input-name')
  inputName(
    @RegistrationPayload() jwtPayload: RegistrationJwtPayload,
    @Body() inputNameRequestDto: InputNameRequestDto,
  ) {
    return this.authService.inputName(jwtPayload, inputNameRequestDto);
  }

  @UseGuards(RegistrationTokenGuard)
  @Post('/input-passcode')
  inputPasscode(
    @RegistrationPayload() jwtPayload: RegistrationJwtPayload,
    @Body() inputPasscodeRequestDto: InputPasscodeRequestDto,
  ) {
    return this.authService.inputPasscode(jwtPayload, inputPasscodeRequestDto);
  }
}
