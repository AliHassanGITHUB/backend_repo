"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = __importDefault(require("stripe"));
const prisma_service_1 = require("../prisma/prisma.service");
const sms_service_1 = require("../sms/sms.service");
const minio_service_1 = require("../minio/minio.service");
const pdfkit_1 = __importDefault(require("pdfkit"));
let PaymentsService = class PaymentsService {
    prisma;
    sms;
    config;
    minio;
    stripe;
    mockEnabled;
    constructor(prisma, sms, config, minio) {
        this.prisma = prisma;
        this.sms = sms;
        this.config = config;
        this.minio = minio;
        const stripeKey = config.get('STRIPE_SECRET_KEY', '');
        this.stripe = stripeKey ? new stripe_1.default(stripeKey) : null;
        this.mockEnabled = config.get('ENABLE_MOCK_PAYMENTS', 'false') === 'true';
    }
    async generatePdfBuffer(application, serial, issuedAt) {
        const doc = new pdfkit_1.default();
        const chunks = [];
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
    async createIntent(applicationId, citizenNationalId) {
        const app = await this.prisma.application.findUnique({
            where: { application_id: applicationId },
            include: { document: true },
        });
        if (!app)
            throw new common_1.NotFoundException('Application not found');
        if (app.citizen_national_id_number !== citizenNationalId) {
            throw new common_1.ForbiddenException('Not your application');
        }
        if (app.application_status !== 'approved and pending payment') {
            throw new common_1.BadRequestException('Application is not approved and pending payment');
        }
        const amount = Math.round(Number(app.document.fees) * 100);
        const pi = await this.stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            metadata: { applicationId: applicationId.toString() },
        });
        return { clientSecret: pi.client_secret };
    }
    async verify(paymentIntentId, citizenNationalId) {
        const existing = await this.prisma.payment.findUnique({
            where: { transaction_reference: paymentIntentId },
        });
        if (existing)
            return existing;
        const pi = await this.stripe.paymentIntents.retrieve(paymentIntentId, {
            expand: ['payment_method'],
        });
        if (pi.status !== 'succeeded') {
            throw new common_1.BadRequestException('Payment has not succeeded');
        }
        const applicationId = parseInt(pi.metadata.applicationId, 10);
        const app = await this.prisma.application.findUnique({
            where: { application_id: applicationId },
            include: { document: true, citizen: true },
        });
        if (!app)
            throw new common_1.NotFoundException('Application not found');
        if (app.citizen_national_id_number !== citizenNationalId) {
            throw new common_1.ForbiddenException('Not your application');
        }
        if (app.application_status !== 'approved and pending payment') {
            throw new common_1.BadRequestException('Application is not approved and pending payment');
        }
        const pm = pi.payment_method;
        const card = pm?.card;
        const issuedAt = new Date();
        const issuedDateStr = issuedAt.toISOString().split('T')[0];
        const issuedDateCompact = issuedDateStr.replace(/-/g, '');
        const maxRes = await this.prisma.$queryRaw `
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
        void this.sms.sendPaymentCompleted(app.citizen.phone_number, app.document.document_name, app.application_reference_number ?? `APP-00${applicationId}`);
        return payment;
    }
    async mockConfirm(applicationId, citizenNationalId) {
        if (!this.mockEnabled) {
            throw new common_1.ForbiddenException('Mock payments are disabled');
        }
        const app = await this.prisma.application.findUnique({
            where: { application_id: applicationId },
            include: { document: true, citizen: true },
        });
        if (!app)
            throw new common_1.NotFoundException('Application not found');
        if (app.citizen_national_id_number !== citizenNationalId) {
            throw new common_1.ForbiddenException('Not your application');
        }
        if (app.application_status !== 'approved and pending payment') {
            throw new common_1.BadRequestException('Application is not approved and pending payment');
        }
        const existing = await this.prisma.payment.findUnique({
            where: { application_id: applicationId },
        });
        if (existing)
            return existing;
        const now = Date.now();
        const ref = `pi_mock${applicationId}${now}`;
        const currentYear = new Date().getFullYear();
        const issuedAt = new Date();
        const issuedDateStr = issuedAt.toISOString().split('T')[0];
        const issuedDateCompact = issuedDateStr.replace(/-/g, '');
        const maxRes = await this.prisma.$queryRaw `
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
        void this.sms.sendPaymentCompleted(app.citizen.phone_number, app.document.document_name, app.application_reference_number ?? `APP-00${applicationId}`);
        return payment;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        sms_service_1.SmsService,
        config_1.ConfigService,
        minio_service_1.MinioService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map