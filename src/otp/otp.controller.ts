import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { OtpService } from './otp.service';
import { GenerateOtpRequestDto, VerifyOtpRequestDto } from './dto/otp.dto';
import { RegistrationTokenGuard } from 'src/common/guards/registration-token.guard';

@Controller('v1/otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @UseGuards(RegistrationTokenGuard)
  @Post('/send-otp')
  async generateAndSendOtp(
    @Body() generateOtpRequestDto: GenerateOtpRequestDto,
  ) {
    return this.otpService.generateOtp(generateOtpRequestDto);
  }

  @UseGuards(RegistrationTokenGuard)
  @Post('/verify-otp')
  async verifyOtp(@Body() verifyOtpRequestDto: VerifyOtpRequestDto) {
    return this.otpService.verifyOtp(verifyOtpRequestDto);
  }
}
