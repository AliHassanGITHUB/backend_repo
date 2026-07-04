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
exports.CitizenController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const citizen_jwt_guard_1 = require("../auth/guards/citizen-jwt.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const citizen_service_1 = require("./citizen.service");
const update_phone_dto_1 = require("./dto/update-phone.dto");
const update_credentials_dto_1 = require("./dto/update-credentials.dto");
let CitizenController = class CitizenController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    getDocuments() {
        return this.svc.getActiveDocuments();
    }
    getDocumentRequirements(code) {
        return this.svc.getDocumentRequirements(code);
    }
    submitApplication(body, files, user) {
        const { documentCode, ...formFields } = body;
        if (!documentCode)
            throw new common_1.BadRequestException('documentCode is required');
        return this.svc.submitApplication(user.sub, documentCode, files ?? [], formFields);
    }
    getMyApplications(user) {
        return this.svc.getMyApplications(user.sub);
    }
    getProfile(user) {
        return this.svc.getProfile(user.sub);
    }
    updatePhone(dto, user) {
        return this.svc.updatePhone(user.sub, dto);
    }
    updateCredentials(dto, user) {
        return this.svc.updateCredentials(user.sub, dto);
    }
    uploadPhoto(file, user) {
        if (!file)
            throw new common_1.BadRequestException('photo file is required');
        return this.svc.uploadPhoto(user.sub, file);
    }
    uploadIdCard(file, user) {
        if (!file)
            throw new common_1.BadRequestException('idCard file is required');
        return this.svc.uploadIdCard(user.sub, file);
    }
    uploadNameIndex(file, user) {
        if (!file)
            throw new common_1.BadRequestException('nameIndex file is required');
        return this.svc.uploadNameIndex(user.sub, file);
    }
};
exports.CitizenController = CitizenController;
__decorate([
    (0, common_1.Get)('documents'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CitizenController.prototype, "getDocuments", null);
__decorate([
    (0, common_1.Get)('documents/:code/requirements'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CitizenController.prototype, "getDocumentRequirements", null);
__decorate([
    (0, common_1.Post)('applications'),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)()),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array, Object]),
    __metadata("design:returntype", void 0)
], CitizenController.prototype, "submitApplication", null);
__decorate([
    (0, common_1.Get)('applications'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CitizenController.prototype, "getMyApplications", null);
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CitizenController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('phone'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_phone_dto_1.UpdatePhoneDto, Object]),
    __metadata("design:returntype", void 0)
], CitizenController.prototype, "updatePhone", null);
__decorate([
    (0, common_1.Patch)('profile/credentials'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_credentials_dto_1.UpdateCredentialsDto, Object]),
    __metadata("design:returntype", void 0)
], CitizenController.prototype, "updateCredentials", null);
__decorate([
    (0, common_1.Post)('profile/photo'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('photo')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CitizenController.prototype, "uploadPhoto", null);
__decorate([
    (0, common_1.Post)('profile/id-card'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('idCard')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CitizenController.prototype, "uploadIdCard", null);
__decorate([
    (0, common_1.Post)('profile/name-index'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('nameIndex')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CitizenController.prototype, "uploadNameIndex", null);
exports.CitizenController = CitizenController = __decorate([
    (0, common_1.Controller)('citizen'),
    (0, common_1.UseGuards)(citizen_jwt_guard_1.CitizenJwtGuard),
    __metadata("design:paramtypes", [citizen_service_1.CitizenService])
], CitizenController);
//# sourceMappingURL=citizen.controller.js.map