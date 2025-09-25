import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CheckPhoneNumberRequestDto,
  EmailVerificationRequestDto,
  InputEmailRequestDto,
  InputNameRequestDto,
  InputPasscodeRequestDto,
  InputPasswordRequestDto,
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

  @UseGuards(RegistrationTokenGuard)
  @Post('/input-password')
  inputPassword(
    @RegistrationPayload() jwtPayload: RegistrationJwtPayload,
    @Body() inputPasswordRequestDto: InputPasswordRequestDto,
  ) {
    return this.authService.inputPassword(jwtPayload, inputPasswordRequestDto);
  }

  @UseGuards(RegistrationTokenGuard)
  @Post('/input-email')
  inputEmail(
    @RegistrationPayload() jwtPayload: RegistrationJwtPayload,
    @Body() inputEmailRequestDto: InputEmailRequestDto,
  ) {
    return this.authService.inputEmail(jwtPayload, inputEmailRequestDto);
  }

  @Get('/email-verification')
  emailVerification(
    @Query() emailVerificationRequestDto: EmailVerificationRequestDto,
  ) {
    return this.authService.emailVerification(
      emailVerificationRequestDto.token,
    );
  }
}
