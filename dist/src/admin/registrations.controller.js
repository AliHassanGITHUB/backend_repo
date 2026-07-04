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
exports.RegistrationsController = void 0;
const common_1 = require("@nestjs/common");
const admin_jwt_guard_1 = require("../auth/guards/admin-jwt.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const registrations_service_1 = require("./registrations.service");
const reject_dto_1 = require("./dto/reject.dto");
let RegistrationsController = class RegistrationsController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    findAll() {
        return this.svc.findAll();
    }
    findOne(reference) {
        return this.svc.findOne(reference);
    }
    approve(reference, user) {
        return this.svc.approve(reference, user.sub);
    }
    reject(reference, dto, user) {
        return this.svc.reject(reference, dto, user.sub);
    }
};
exports.RegistrationsController = RegistrationsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':reference'),
    __param(0, (0, common_1.Param)('reference')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':reference/approve'),
    __param(0, (0, common_1.Param)('reference')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':reference/reject'),
    __param(0, (0, common_1.Param)('reference')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reject_dto_1.RejectDto, Object]),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "reject", null);
exports.RegistrationsController = RegistrationsController = __decorate([
    (0, common_1.Controller)('admin/registrations'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    __metadata("design:paramtypes", [registrations_service_1.RegistrationsService])
], RegistrationsController);
//# sourceMappingURL=registrations.controller.js.map