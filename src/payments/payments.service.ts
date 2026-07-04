import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class PaymentsService {
  // InstanceType used because Stripe is both a class and a namespace in v22
  private readonly stripe: InstanceType<typeof Stripe>;
  private readonly mockEnabled: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly sms: SmsService,
    private readonly config: ConfigService,
  ) {
    const stripeKey = config.get<string>('STRIPE_SECRET_KEY', '');
    this.stripe = stripeKey ? new Stripe(stripeKey) : (null as unknown as InstanceType<typeof Stripe>);
    this.mockEnabled = config.get<string>('ENABLE_MOCK_PAYMENTS', 'false') === 'true';
  }

  async createIntent(applicationId: number, citizenNationalId: string) {
    const app = await this.prisma.application.findUnique({
      where: { application_id: applicationId },
      include: { document: true },
    });
    if (!app) throw new NotFoundException('Application not found');
    if (app.citizen_national_id_number !== citizenNationalId) {
      throw new ForbiddenException('Not your application');
    }
    if (app.application_status !== 'approved and pending payment') {
      throw new BadRequestException('Application is not approved and pending payment');
    }

    const amount = Math.round(Number(app.document.fees) * 100); // cents
    const pi = await this.stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { applicationId: applicationId.toString() },
    });

    return { clientSecret: pi.client_secret };
  }

  async verify(paymentIntentId: string, citizenNationalId: string) {
    // Idempotency — already recorded
    const existing = await this.prisma.payment.findUnique({
      where: { transaction_reference: paymentIntentId },
    });
    if (existing) return existing;

    const pi = await this.stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['payment_method'],
    });
    if (pi.status !== 'succeeded') {
      throw new BadRequestException('Payment has not succeeded');
    }

    const applicationId = parseInt(pi.metadata.applicationId, 10);
    const app = await this.prisma.application.findUnique({
      where: { application_id: applicationId },
      include: { document: true, citizen: true },
    });
    if (!app) throw new NotFoundException('Application not found');
    if (app.citizen_national_id_number !== citizenNationalId) {
      throw new ForbiddenException('Not your application');
    }
    if (app.application_status !== 'approved and pending payment') {
      throw new BadRequestException('Application is not approved and pending payment');
    }

    const pm = pi.payment_method as any;
    const card = pm?.card as { last4: string; exp_month: number; exp_year: number } | undefined;

    const payment = await this.prisma.$transaction(async (tx) => {
      const rec = await tx.payment.create({
        data: {
          application_id: applicationId,
          amount: app.document.fees,
          currency: 'USD',
          card_number: card ? `xxxx${card.last4}` : 'unknown',
          card_expiry_month: card?.exp_month ?? 0,
          card_expiry_year: card?.exp_year ?? 0,
          transaction_reference: paymentIntentId,
        },
      });
      await tx.application.update({
        where: { application_id: applicationId },
        data: {
          application_status: 'completed and issued',
          completed_at: new Date(),
        },
      });
      return rec;
    });

    // Best-effort SMS
    void this.sms.sendPaymentCompleted(
      app.citizen.phone_number,
      app.document.document_name,
      app.application_reference_number ?? `APP-00${applicationId}`,
    );

    return payment;
  }

  async mockConfirm(applicationId: number, citizenNationalId: string) {
    if (!this.mockEnabled) {
      throw new ForbiddenException('Mock payments are disabled');
    }

    const app = await this.prisma.application.findUnique({
      where: { application_id: applicationId },
      include: { document: true, citizen: true },
    });
    if (!app) throw new NotFoundException('Application not found');
    if (app.citizen_national_id_number !== citizenNationalId) {
      throw new ForbiddenException('Not your application');
    }
    if (app.application_status !== 'approved and pending payment') {
      throw new BadRequestException('Application is not approved and pending payment');
    }

    // Idempotency — if payment already recorded for this app, return it
    const existing = await this.prisma.payment.findUnique({
      where: { application_id: applicationId },
    });
    if (existing) return existing;

    const now = Date.now();
    const ref = `pi_mock${applicationId}${now}`;
    const currentYear = new Date().getFullYear();

    const payment = await this.prisma.$transaction(async (tx) => {
      const rec = await tx.payment.create({
        data: {
          application_id: applicationId,
          amount: app.document.fees,
          currency: 'USD',
          card_number: '4242',
          card_expiry_month: 12,
          card_expiry_year: currentYear + 2,
          transaction_reference: ref,
        },
      });
      await tx.application.update({
        where: { application_id: applicationId },
        data: {
          application_status: 'completed and issued',
          completed_at: new Date(),
        },
      });
      return rec;
    });

    void this.sms.sendPaymentCompleted(
      app.citizen.phone_number,
      app.document.document_name,
      app.application_reference_number ?? `APP-00${applicationId}`,
    );

    return payment;
  }
}
