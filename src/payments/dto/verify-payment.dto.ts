import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class VerifyPaymentDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^pi_[A-Za-z0-9]+$/)
  paymentIntentId: string;
}
