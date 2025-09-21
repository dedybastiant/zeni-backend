import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { GenerateOtpRequestDto } from './dto/otp.dto';

@Controller('v1/otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('/send-otp')
  async generateAndSendOtp(
    @Body() generateOtpRequestDto: GenerateOtpRequestDto,
  ) {
    return this.otpService.generateOtp(generateOtpRequestDto);
  }
}
