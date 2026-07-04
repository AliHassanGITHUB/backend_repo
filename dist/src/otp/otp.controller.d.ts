import { OtpService } from './otp.service';
import { SendOtpDto } from './dto/send-otp.dto';
export declare class OtpController {
    private readonly otp;
    constructor(otp: OtpService);
    send(dto: SendOtpDto): Promise<{
        sent: boolean;
    }>;
}
