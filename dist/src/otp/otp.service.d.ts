import { VerifyService } from '../verify/verify.service';
export declare class OtpService {
    private readonly verify;
    private readonly lastSentAt;
    constructor(verify: VerifyService);
    send(phoneNumber: string): Promise<void>;
}
