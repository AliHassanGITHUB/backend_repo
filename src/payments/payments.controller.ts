import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CitizenJwtGuard } from '../auth/guards/citizen-jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { CreateIntentDto } from './dto/create-intent.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { MockConfirmDto } from './dto/mock-confirm.dto';

@Controller('payments')
@UseGuards(CitizenJwtGuard)
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('create-intent')
  createIntent(@Body() dto: CreateIntentDto, @CurrentUser() user: { sub: string }) {
    return this.payments.createIntent(dto.applicationId, user.sub);
  }

  @Post('verify')
  verify(@Body() dto: VerifyPaymentDto, @CurrentUser() user: { sub: string }) {
    return this.payments.verify(dto.paymentIntentId, user.sub);
  }

  @Post('mock-confirm')
  mockConfirm(@Body() dto: MockConfirmDto, @CurrentUser() user: { sub: string }) {
    return this.payments.mockConfirm(dto.applicationId, user.sub);
  }
}
