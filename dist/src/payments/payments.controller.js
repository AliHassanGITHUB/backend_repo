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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const citizen_jwt_guard_1 = require("../auth/guards/citizen-jwt.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const payments_service_1 = require("./payments.service");
const create_intent_dto_1 = require("./dto/create-intent.dto");
const verify_payment_dto_1 = require("./dto/verify-payment.dto");
const mock_confirm_dto_1 = require("./dto/mock-confirm.dto");
let PaymentsController = class PaymentsController {
    payments;
    constructor(payments) {
        this.payments = payments;
    }
    createIntent(dto, user) {
        return this.payments.createIntent(dto.applicationId, user.sub);
    }
    verify(dto, user) {
        return this.payments.verify(dto.paymentIntentId, user.sub);
    }
    mockConfirm(dto, user) {
        return this.payments.mockConfirm(dto.applicationId, user.sub);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('create-intent'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_intent_dto_1.CreateIntentDto, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createIntent", null);
__decorate([
    (0, common_1.Post)('verify'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_payment_dto_1.VerifyPaymentDto, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "verify", null);
__decorate([
    (0, common_1.Post)('mock-confirm'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mock_confirm_dto_1.MockConfirmDto, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "mockConfirm", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    (0, common_1.UseGuards)(citizen_jwt_guard_1.CitizenJwtGuard),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map