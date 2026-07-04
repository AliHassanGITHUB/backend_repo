import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly client: ReturnType<typeof twilio> | null;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const sid = config.get<string>('TWILIO_ACCOUNT_SID', '');
    const token = config.get<string>('TWILIO_AUTH_TOKEN', '');
    this.from = config.get<string>('TWILIO_FROM_NUMBER', '');

    if (sid && token && this.from) {
      this.client = twilio(sid, token);
    } else {
      this.client = null;
      this.logger.warn('Twilio not configured — SMS disabled');
    }
  }

  private normalize(phone: string): string {
    return phone.replace(/\s+/g, '');
  }

  private async send(to: string, body: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.messages.create({ from: this.from, to: this.normalize(to), body });
    } catch (err) {
      this.logger.error(`SMS failed to ${to}: ${(err as Error).message}`);
    }
  }

  async sendRegistrationApproved(phone: string, reference: string): Promise<void> {
    await this.send(
      phone,
      `Your registration request has been approved, and you now have an account. ` +
        `Use this reference number (${reference}) on the login screen to retrieve your credentials. ` +
        `Please save this number for future inquiries.`,
    );
  }

  async sendRegistrationRejected(phone: string, reason: string, reference: string): Promise<void> {
    await this.send(
      phone,
      `Your registration request has been rejected, and you will need to register again. ` +
        `Rejection reason: ${reason}. ` +
        `Use this reference number (${reference}) on the login screen to review the details.`,
    );
  }

  async sendApplicationApproved(phone: string): Promise<void> {
    await this.send(
      phone,
      `Your application has been approved and is now awaiting payment. ` +
        `Once payment is completed, your document will be prepared for collection.`,
    );
  }

  async sendApplicationRejected(phone: string, reason: string): Promise<void> {
    await this.send(
      phone,
      `Your application has been rejected, and you will need to apply again. ` +
        `Rejection reason: ${reason}.`,
    );
  }

  async sendPaymentCompleted(phone: string, documentName: string, referenceNumber: string): Promise<void> {
    await this.send(
      phone,
      `Payment received. Your ${documentName} is ready to be collected from our office. ` +
        `Please present this reference number: ${referenceNumber}.`,
    );
  }
}
