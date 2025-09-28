import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OtpService } from './otp.service';
import { GenerateOtpRequestDto, VerifyOtpRequestDto } from './dto/otp.dto';
import { RegistrationTokenGuard } from 'src/common/guards/auth-token.guard';

@Controller('v1/otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @UseGuards(RegistrationTokenGuard)
  @Post('/register/send-otp')
  @HttpCode(HttpStatus.OK)
  async generateAndSendOtpRegister(
    @Body() generateOtpRequestDto: GenerateOtpRequestDto,
  ) {
    return this.otpService.generateOtp(generateOtpRequestDto);
  }

  @UseGuards(RegistrationTokenGuard)
  @Post('/register/verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtpRegister(@Body() verifyOtpRequestDto: VerifyOtpRequestDto) {
    return this.otpService.verifyOtp(verifyOtpRequestDto);
  }

  @Post('/login/send-otp')
  @HttpCode(HttpStatus.OK)
  async generateAndSendOtpLogin(
    @Body() generateOtpRequestDto: GenerateOtpRequestDto,
  ) {
    return this.otpService.generateOtp(generateOtpRequestDto);
  }

  @Post('/login/verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtpLogin(@Body() verifyOtpRequestDto: VerifyOtpRequestDto) {
    return this.otpService.verifyOtp(verifyOtpRequestDto);
  }
}
