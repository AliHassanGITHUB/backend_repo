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
import { MinioService } from '../minio/minio.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class PaymentsService {
  // InstanceType used because Stripe is both a class and a namespace in v22
  private readonly stripe: InstanceType<typeof Stripe>;
  private readonly mockEnabled: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly sms: SmsService,
    private readonly config: ConfigService,
    private readonly minio: MinioService,
  ) {
    const stripeKey = config.get<string>('STRIPE_SECRET_KEY', '');
    this.stripe = stripeKey ? new Stripe(stripeKey) : (null as unknown as InstanceType<typeof Stripe>);
    this.mockEnabled = config.get<string>('ENABLE_MOCK_PAYMENTS', 'false') === 'true';
  }

  private async generatePdfBuffer(application: any, serial: string, issuedAt: Date): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      doc.fontSize(20).text('Issued Document', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Serial: ${serial}`);
      doc.text(`Document: ${application.document.document_name} (${application.document.document_code})`);
      doc.text(`Citizen: ${application.citizen.citizen_first_name} ${application.citizen.citizen_last_name} (${application.citizen.citizen_national_id_number})`);
      doc.text(`Issued at: ${issuedAt.toISOString().split('T')[0]}`);
      doc.moveDown();
      doc.text('This is an official issued document.', { align: 'left' });

      doc.end();
    });
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

    // Build serial number: determine next sequence for document_code + date
    const issuedAt = new Date();
    const issuedDateStr = issuedAt.toISOString().split('T')[0]; // YYYY-MM-DD
    const issuedDateCompact = issuedDateStr.replace(/-/g, ''); // YYYYMMDD

    const maxRes: any = await this.prisma.$queryRaw`
      SELECT COALESCE(MAX((substring(serial_number from '([0-9]{4})$'))::int), 0) as maxseq
      FROM issued_document
      WHERE document_code = ${app.document.document_code}
        AND issued_at = ${issuedDateStr}
    `;
    const maxSeq = (Array.isArray(maxRes) ? maxRes[0]?.maxseq : maxRes?.maxseq) ?? 0;
    const nextSeq = (Number(maxSeq) || 0) + 1;
    const seqStr = String(nextSeq).padStart(4, '0');
    const serial = `ISS-${app.document.document_code}-${issuedDateCompact}-${seqStr}`;

    // Generate PDF and upload
    const pdfBuffer = await this.generatePdfBuffer(app, serial, issuedAt);
    const key = `issued_documents/${app.document.document_code}/${issuedDateCompact}/${serial}.pdf`;
    const documentUrl = await this.minio.uploadFile(pdfBuffer, key, 'application/pdf');

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

      await tx.issued_document.create({
        data: {
          citizen_national_id_number: app.citizen.citizen_national_id_number,
          document_code: app.document.document_code,
          application_id: applicationId,
          serial_number: serial,
          document_url: documentUrl,
          issued_at: issuedAt,
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

    // Build serial number and PDF for issued document
    const issuedAt = new Date();
    const issuedDateStr = issuedAt.toISOString().split('T')[0];
    const issuedDateCompact = issuedDateStr.replace(/-/g, '');
    const maxRes: any = await this.prisma.$queryRaw`
      SELECT COALESCE(MAX((substring(serial_number from '([0-9]{4})$'))::int), 0) as maxseq
      FROM issued_document
      WHERE document_code = ${app.document.document_code}
        AND issued_at = ${issuedDateStr}
    `;
    const maxSeq = (Array.isArray(maxRes) ? maxRes[0]?.maxseq : maxRes?.maxseq) ?? 0;
    const nextSeq = (Number(maxSeq) || 0) + 1;
    const seqStr = String(nextSeq).padStart(4, '0');
    const serial = `ISS-${app.document.document_code}-${issuedDateCompact}-${seqStr}`;

    const pdfBuffer = await this.generatePdfBuffer(app, serial, issuedAt);
    const key = `issued_documents/${app.document.document_code}/${issuedDateCompact}/${serial}.pdf`;
    const documentUrl = await this.minio.uploadFile(pdfBuffer, key, 'application/pdf');

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

      await tx.issued_document.create({
        data: {
          citizen_national_id_number: app.citizen.citizen_national_id_number,
          document_code: app.document.document_code,
          application_id: applicationId,
          serial_number: serial,
          document_url: documentUrl,
          issued_at: issuedAt,
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
