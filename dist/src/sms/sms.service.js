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
var SmsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const twilio_1 = __importDefault(require("twilio"));
let SmsService = SmsService_1 = class SmsService {
    config;
    logger = new common_1.Logger(SmsService_1.name);
    client;
    from;
    constructor(config) {
        this.config = config;
        const sid = config.get('TWILIO_ACCOUNT_SID', '');
        const token = config.get('TWILIO_AUTH_TOKEN', '');
        this.from = config.get('TWILIO_FROM_NUMBER', '');
        if (sid && token && this.from) {
            this.client = (0, twilio_1.default)(sid, token);
        }
        else {
            this.client = null;
            this.logger.warn('Twilio not configured — SMS disabled');
        }
    }
    normalize(phone) {
        return phone.replace(/\s+/g, '');
    }
    async send(to, body) {
        if (!this.client)
            return;
        try {
            await this.client.messages.create({ from: this.from, to: this.normalize(to), body });
        }
        catch (err) {
            this.logger.error(`SMS failed to ${to}: ${err.message}`);
        }
    }
    async sendRegistrationApproved(phone, reference) {
        await this.send(phone, `Your registration request has been approved, and you now have an account. ` +
            `Use this reference number (${reference}) on the login screen to retrieve your credentials. ` +
            `Please save this number for future inquiries.`);
    }
    async sendRegistrationRejected(phone, reason, reference) {
        await this.send(phone, `Your registration request has been rejected, and you will need to register again. ` +
            `Rejection reason: ${reason}. ` +
            `Use this reference number (${reference}) on the login screen to review the details.`);
    }
    async sendApplicationApproved(phone) {
        await this.send(phone, `Your application has been approved and is now awaiting payment. ` +
            `Once payment is completed, your document will be prepared for collection.`);
    }
    async sendApplicationRejected(phone, reason) {
        await this.send(phone, `Your application has been rejected, and you will need to apply again. ` +
            `Rejection reason: ${reason}.`);
    }
    async sendPaymentCompleted(phone, documentName, referenceNumber) {
        await this.send(phone, `Payment received. Your ${documentName} is ready to be collected from our office. ` +
            `Please present this reference number: ${referenceNumber}.`);
    }
};
exports.SmsService = SmsService;
exports.SmsService = SmsService = SmsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SmsService);
//# sourceMappingURL=sms.service.js.map