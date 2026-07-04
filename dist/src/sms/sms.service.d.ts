import { ConfigService } from '@nestjs/config';
export declare class SmsService {
    private readonly config;
    private readonly logger;
    private readonly client;
    private readonly from;
    constructor(config: ConfigService);
    private normalize;
    private send;
    sendRegistrationApproved(phone: string, reference: string): Promise<void>;
    sendRegistrationRejected(phone: string, reason: string, reference: string): Promise<void>;
    sendApplicationApproved(phone: string): Promise<void>;
    sendApplicationRejected(phone: string, reason: string): Promise<void>;
    sendPaymentCompleted(phone: string, documentName: string, referenceNumber: string): Promise<void>;
}
