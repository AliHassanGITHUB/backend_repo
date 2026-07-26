import { ConfigService } from '@nestjs/config';
export declare class VerifyService {
    private readonly config;
    private readonly mockEnabled;
    private readonly otpStore;
    constructor(config: ConfigService);
    private normalizePhone;
    private createMockOtp;
    start(phone: string): Promise<{
        mockOtp?: string;
    }>;
    check(phone: string, code: string): Promise<boolean>;
}
