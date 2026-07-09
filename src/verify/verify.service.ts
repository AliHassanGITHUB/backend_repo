import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VerifyService {
  private readonly mockEnabled: boolean;
  private readonly otpStore = new Map<string, string>();

  constructor(private readonly config: ConfigService) {
    this.mockEnabled = this.config.get<string>('ENABLE_MOCK_OTP', 'false') === 'true';
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/\s+/g, '');
  }

  private createMockOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async start(phone: string): Promise<{ mockOtp?: string }> {
    const normalizedPhone = this.normalizePhone(phone);

    if (!this.mockEnabled) {
      return {};
    }

    const mockOtp = this.createMockOtp();
    this.otpStore.set(normalizedPhone, mockOtp);
    return { mockOtp };
  }

  async check(phone: string, code: string): Promise<boolean> {
    const normalizedPhone = this.normalizePhone(phone);
    const stored = this.otpStore.get(normalizedPhone);

    if (!stored) {
      return false;
    }

    if (stored === code) {
      this.otpStore.delete(normalizedPhone);
      return true;
    }

    return false;
  }
}
