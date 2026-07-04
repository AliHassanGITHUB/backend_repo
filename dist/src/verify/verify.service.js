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
exports.VerifyService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const twilio_1 = __importDefault(require("twilio"));
let VerifyService = class VerifyService {
    config;
    client;
    serviceSid;
    constructor(config) {
        this.config = config;
        this.client = (0, twilio_1.default)(this.config.get('TWILIO_ACCOUNT_SID'), this.config.get('TWILIO_AUTH_TOKEN'));
        this.serviceSid = this.config.getOrThrow('TWILIO_VERIFY_SERVICE_SID');
    }
    toE164(phone) {
        return phone.replace(/\s+/g, '');
    }
    async start(phone) {
        await this.client.verify.v2
            .services(this.serviceSid)
            .verifications.create({ to: this.toE164(phone), channel: 'sms' });
    }
    async check(phone, code) {
        try {
            const result = await this.client.verify.v2
                .services(this.serviceSid)
                .verificationChecks.create({ to: this.toE164(phone), code });
            return result.status === 'approved';
        }
        catch {
            return false;
        }
    }
};
exports.VerifyService = VerifyService;
exports.VerifyService = VerifyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], VerifyService);
//# sourceMappingURL=verify.service.js.map