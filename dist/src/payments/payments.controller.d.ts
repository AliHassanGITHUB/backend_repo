import { PaymentsService } from './payments.service';
import { CreateIntentDto } from './dto/create-intent.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { MockConfirmDto } from './dto/mock-confirm.dto';
export declare class PaymentsController {
    private readonly payments;
    constructor(payments: PaymentsService);
    createIntent(dto: CreateIntentDto, user: {
        sub: string;
    }): Promise<{
        clientSecret: string | null;
    }>;
    verify(dto: VerifyPaymentDto, user: {
        sub: string;
    }): Promise<{
        created_at: Date;
        application_id: number;
        payment_id: number;
        transaction_reference: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        card_number: string;
        card_expiry_month: number;
        card_expiry_year: number;
    }>;
    mockConfirm(dto: MockConfirmDto, user: {
        sub: string;
    }): Promise<{
        created_at: Date;
        application_id: number;
        payment_id: number;
        transaction_reference: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        card_number: string;
        card_expiry_month: number;
        card_expiry_year: number;
    }>;
}
