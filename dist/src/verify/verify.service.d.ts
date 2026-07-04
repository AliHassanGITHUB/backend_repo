import { ConfigService } from '@nestjs/config';
export declare class VerifyService {
    private readonly config;
    private readonly client;
    private readonly serviceSid;
    constructor(config: ConfigService);
    private toE164;
    start(phone: string): Promise<void>;
    check(phone: string, code: string): Promise<boolean>;
}
