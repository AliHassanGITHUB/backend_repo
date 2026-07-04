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
exports.CitizenRegisterDto = void 0;
const class_validator_1 = require("class-validator");
const LONG_NAME = /^[A-Z][a-z][a-z]+( [A-Z][a-z]+)*$/;
const SHORT_NAME = /^[A-Z][a-z]+( [A-Z][a-z]+)*$/;
class CitizenRegisterDto {
    nationalId;
    firstName;
    fatherName;
    lastName;
    motherFirstName;
    motherLastName;
    dateOfBirth;
    placeOfBirth;
    gender;
    phoneNumber;
    otpCode;
}
exports.CitizenRegisterDto = CitizenRegisterDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^LBN-[0-9]{4}-[0-9]{5}$/, {
        message: 'nationalId must be in format LBN-YYYY-NNNNN',
    }),
    __metadata("design:type", String)
], CitizenRegisterDto.prototype, "nationalId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(LONG_NAME),
    __metadata("design:type", String)
], CitizenRegisterDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(LONG_NAME),
    __metadata("design:type", String)
], CitizenRegisterDto.prototype, "fatherName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(SHORT_NAME),
    __metadata("design:type", String)
], CitizenRegisterDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(LONG_NAME),
    __metadata("design:type", String)
], CitizenRegisterDto.prototype, "motherFirstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(SHORT_NAME),
    __metadata("design:type", String)
], CitizenRegisterDto.prototype, "motherLastName", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CitizenRegisterDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(LONG_NAME),
    __metadata("design:type", String)
], CitizenRegisterDto.prototype, "placeOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['Male', 'Female']),
    __metadata("design:type", String)
], CitizenRegisterDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^\+961 (01|03|70|71|76|81) [0-9]{3} [0-9]{3}$/, {
        message: 'phoneNumber must be in format +961 XX XXX XXX',
    }),
    __metadata("design:type", String)
], CitizenRegisterDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[0-9]{4,8}$/, { message: 'otpCode must be a numeric code' }),
    __metadata("design:type", String)
], CitizenRegisterDto.prototype, "otpCode", void 0);
//# sourceMappingURL=citizen-register.dto.js.map