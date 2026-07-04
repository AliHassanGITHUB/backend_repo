import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from '../sms/sms.service';
export declare class PaymentsService {
    private readonly prisma;
    private readonly sms;
    private readonly config;
    private readonly stripe;
    private readonly mockEnabled;
    constructor(prisma: PrismaService, sms: SmsService, config: ConfigService);
    createIntent(applicationId: number, citizenNationalId: string): Promise<{
        clientSecret: string | null;
    }>;
    verify(paymentIntentId: string, citizenNationalId: string): Promise<{
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
    mockConfirm(applicationId: number, citizenNationalId: string): Promise<{
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
