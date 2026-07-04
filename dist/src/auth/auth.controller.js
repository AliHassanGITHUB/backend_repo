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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const auth_service_1 = require("./auth.service");
const admin_login_dto_1 = require("./dto/admin-login.dto");
const citizen_login_dto_1 = require("./dto/citizen-login.dto");
const citizen_register_dto_1 = require("./dto/citizen-register.dto");
const track_registration_dto_1 = require("./dto/track-registration.dto");
const forgot_password_start_dto_1 = require("./dto/forgot-password-start.dto");
const forgot_password_reset_dto_1 = require("./dto/forgot-password-reset.dto");
let AuthController = class AuthController {
    auth;
    constructor(auth) {
        this.auth = auth;
    }
    adminLogin(dto) {
        return this.auth.adminLogin(dto);
    }
    citizenLogin(dto) {
        return this.auth.citizenLogin(dto);
    }
    citizenRegister(dto, files) {
        const photo = files?.photo?.[0];
        const idCopy = files?.idCopy?.[0];
        const nameIndex = files?.nameIndex?.[0];
        if (!photo)
            throw new common_1.BadRequestException('photo file is required');
        if (idCopy && nameIndex)
            throw new common_1.BadRequestException('Provide either idCopy or nameIndex, not both');
        if (!idCopy && !nameIndex)
            throw new common_1.BadRequestException('Either idCopy or nameIndex is required');
        return this.auth.citizenRegister(dto, photo, idCopy, nameIndex);
    }
    trackRegistration(dto) {
        return this.auth.trackRegistration(dto);
    }
    forgotPasswordStart(dto) {
        return this.auth.forgotPasswordStart(dto);
    }
    forgotPasswordReset(dto) {
        return this.auth.forgotPasswordReset(dto);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('admin/login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_login_dto_1.AdminLoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "adminLogin", null);
__decorate([
    (0, common_1.Post)('citizen/login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [citizen_login_dto_1.CitizenLoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "citizenLogin", null);
__decorate([
    (0, common_1.Post)('citizen/register'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'photo', maxCount: 1 },
        { name: 'idCopy', maxCount: 1 },
        { name: 'nameIndex', maxCount: 1 },
    ])),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [citizen_register_dto_1.CitizenRegisterDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "citizenRegister", null);
__decorate([
    (0, common_1.Post)('citizen/registration-status'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [track_registration_dto_1.TrackRegistrationDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "trackRegistration", null);
__decorate([
    (0, common_1.Post)('citizen/forgot-password/start'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_start_dto_1.ForgotPasswordStartDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "forgotPasswordStart", null);
__decorate([
    (0, common_1.Post)('citizen/forgot-password/reset'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_reset_dto_1.ForgotPasswordResetDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "forgotPasswordReset", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map