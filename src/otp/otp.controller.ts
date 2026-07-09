import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { SendOtpDto } from './dto/send-otp.dto';

@Controller('otp')
export class OtpController {
  constructor(private readonly otp: OtpService) {}

  @Post('send')
  async send(@Body() dto: SendOtpDto) {
    const result = await this.otp.send(dto.phoneNumber);
    return { sent: true, ...result };
  }
}
