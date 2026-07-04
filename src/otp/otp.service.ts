import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { VerifyService } from '../verify/verify.service';

const COOLDOWN_MS = 30_000;

@Injectable()
export class OtpService {
  // In-memory only — no DB table backs OTP state, Twilio Verify is the source of truth
  private readonly lastSentAt = new Map<string, number>();

  constructor(private readonly verify: VerifyService) {}

  async send(phoneNumber: string): Promise<void> {
    const key = phoneNumber.replace(/\s+/g, '');
    const now = Date.now();
    const last = this.lastSentAt.get(key);
    if (last && now - last < COOLDOWN_MS) {
      throw new HttpException(
        'Please wait before requesting another code',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    this.lastSentAt.set(key, now);
    await this.verify.start(phoneNumber);
  }
}
