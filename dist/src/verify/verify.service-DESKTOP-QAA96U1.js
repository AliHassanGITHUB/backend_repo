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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let VerifyService = class VerifyService {
    config;
    mockEnabled;
    otpStore = new Map();
    constructor(config) {
        this.config = config;
        this.mockEnabled = this.config.get('ENABLE_MOCK_OTP', 'false') === 'true';
    }
    normalizePhone(phone) {
        return phone.replace(/\s+/g, '');
    }
    createMockOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async start(phone) {
        const normalizedPhone = this.normalizePhone(phone);
        if (!this.mockEnabled) {
            return {};
        }
        const mockOtp = this.createMockOtp();
        this.otpStore.set(normalizedPhone, mockOtp);
        return { mockOtp };
    }
    async check(phone, code) {
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
};
exports.VerifyService = VerifyService;
exports.VerifyService = VerifyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], VerifyService);
//# sourceMappingURL=verify.service.js.map