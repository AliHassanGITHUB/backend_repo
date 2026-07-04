import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

@Injectable()
export class VerifyService {
  private readonly client: ReturnType<typeof twilio>;
  private readonly serviceSid: string;

  constructor(private readonly config: ConfigService) {
    this.client = twilio(
      this.config.get<string>('TWILIO_ACCOUNT_SID'),
      this.config.get<string>('TWILIO_AUTH_TOKEN'),
    );
    this.serviceSid = this.config.getOrThrow<string>('TWILIO_VERIFY_SERVICE_SID');
  }

  // Stored numbers look like "+961 70 123 456" — Twilio Verify needs E.164
  private toE164(phone: string): string {
    return phone.replace(/\s+/g, '');
  }

  async start(phone: string): Promise<void> {
    await this.client.verify.v2
      .services(this.serviceSid)
      .verifications.create({ to: this.toE164(phone), channel: 'sms' });
  }

  // Twilio throws (404/expired/no pending verification) instead of returning
  // "pending" in those cases — treat any such failure as "not approved"
  async check(phone: string, code: string): Promise<boolean> {
    try {
      const result = await this.client.verify.v2
        .services(this.serviceSid)
        .verificationChecks.create({ to: this.toE164(phone), code });
      return result.status === 'approved';
    } catch {
      return false;
    }
  }
}
