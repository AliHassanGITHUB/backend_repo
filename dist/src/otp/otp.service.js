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
exports.OtpService = void 0;
const common_1 = require("@nestjs/common");
const verify_service_1 = require("../verify/verify.service");
const COOLDOWN_MS = 30_000;
let OtpService = class OtpService {
    verify;
    lastSentAt = new Map();
    constructor(verify) {
        this.verify = verify;
    }
    async send(phoneNumber) {
        const key = phoneNumber.replace(/\s+/g, '');
        const now = Date.now();
        const last = this.lastSentAt.get(key);
        if (last && now - last < COOLDOWN_MS) {
            throw new common_1.HttpException('Please wait before requesting another code', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        this.lastSentAt.set(key, now);
        await this.verify.start(phoneNumber);
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [verify_service_1.VerifyService])
], OtpService);
//# sourceMappingURL=otp.service.js.map