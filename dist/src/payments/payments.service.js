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
let PaymentsService = class PaymentsService {
    prisma;
    sms;
    config;
    stripe;
    mockEnabled;
    constructor(prisma, sms, config) {
        this.prisma = prisma;
        this.sms = sms;
        this.config = config;
        const stripeKey = config.get('STRIPE_SECRET_KEY', '');
        this.stripe = stripeKey ? new stripe_1.default(stripeKey) : null;
        this.mockEnabled = config.get('ENABLE_MOCK_PAYMENTS', 'false') === 'true';
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
        void this.sms.sendPaymentCompleted(app.citizen.phone_number, app.document.document_name, app.application_reference_number ?? `APP-00${applicationId}`);
        return payment;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        sms_service_1.SmsService,
        config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map