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
exports.UpdateRequirementDto = exports.CreateRequirementDto = void 0;
const class_validator_1 = require("class-validator");
const VALID_TYPES = ['image', 'PDF document', 'form'];
class CreateRequirementDto {
    code;
    name;
    type;
}
exports.CreateRequirementDto = CreateRequirementDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[A-Z0-9]{2,12}REQ$/, {
        message: 'code must end with REQ (e.g. "PP000001REQ")',
    }),
    __metadata("design:type", String)
], CreateRequirementDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[A-Z][a-z]{2,}( [A-Z0-9][a-z]*)*$/, {
        message: 'name must be title-cased (e.g. "Personal Photo")',
    }),
    __metadata("design:type", String)
], CreateRequirementDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsIn)(VALID_TYPES),
    __metadata("design:type", String)
], CreateRequirementDto.prototype, "type", void 0);
class UpdateRequirementDto {
    name;
    type;
}
exports.UpdateRequirementDto = UpdateRequirementDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[A-Z][a-z]{2,}( [A-Z0-9][a-z]*)*$/),
    __metadata("design:type", String)
], UpdateRequirementDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(VALID_TYPES),
    __metadata("design:type", String)
], UpdateRequirementDto.prototype, "type", void 0);
//# sourceMappingURL=create-requirement.dto.js.map