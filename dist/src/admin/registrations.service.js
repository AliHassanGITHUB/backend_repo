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
exports.RegistrationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const hashing_service_1 = require("../auth/hashing.service");
const sms_service_1 = require("../sms/sms.service");
const constants_1 = require("../common/constants");
let RegistrationsService = class RegistrationsService {
    prisma;
    hashing;
    sms;
    constructor(prisma, hashing, sms) {
        this.prisma = prisma;
        this.hashing = hashing;
        this.sms = sms;
    }
    findAll() {
        return this.prisma.citizen_registration_request.findMany({
            orderBy: [{ request_status: 'asc' }, { created_at: 'desc' }],
        });
    }
    async findOne(reference) {
        const reg = await this.prisma.citizen_registration_request.findUnique({
            where: { registration_reference_number: reference },
        });
        if (!reg)
            throw new common_1.NotFoundException('Registration request not found');
        return reg;
    }
    async approve(reference, adminNationalId) {
        const reg = await this.prisma.citizen_registration_request.findUnique({
            where: { registration_reference_number: reference },
        });
        if (!reg)
            throw new common_1.NotFoundException('Registration request not found');
        if (reg.request_status !== 'pending') {
            throw new common_1.BadRequestException('Registration request is not pending');
        }
        const nationalId = reg.citizen_national_id_number;
        const digits = nationalId.replace(/\D/g, '').slice(0, 9).padStart(9, '0');
        const firstName = (reg.citizen_first_name ?? '').toLowerCase().replace(/[^a-z]/g, '') || 'user';
        const username = `${firstName}.${digits}`;
        const plainPassword = constants_1.DEFAULT_CITIZEN_PASSWORD;
        const hashedPassword = await this.hashing.hash(plainPassword);
        await this.prisma.$transaction(async (tx) => {
            await tx.citizen.create({
                data: {
                    citizen_national_id_number: nationalId,
                    citizen_first_name: reg.citizen_first_name,
                    citizen_father_name: reg.citizen_father_name,
                    citizen_last_name: reg.citizen_last_name,
                    mother_first_name: reg.mother_first_name,
                    mother_last_name: reg.mother_last_name,
                    date_of_birth: reg.date_of_birth,
                    place_of_birth: reg.place_of_birth,
                    gender: reg.gender,
                    phone_number: reg.phone_number,
                    photo_url: reg.photo_url,
                    id_card_copy_url: reg.id_card_copy_url,
                    name_index_copy_url: reg.name_index_copy_url,
                    citizen_username: username,
                    citizen_password: hashedPassword,
                    is_active: true,
                    created_by: adminNationalId,
                },
            });
            await tx.citizen_registration_request.update({
                where: { registration_reference_number: reference },
                data: {
                    request_status: 'approved',
                    reviewed_at: new Date(),
                    reviewed_by: adminNationalId,
                },
            });
        });
        void this.sms.sendRegistrationApproved(reg.phone_number, reference);
        return { username, plainPassword, reference };
    }
    async reject(reference, dto, adminNationalId) {
        const reg = await this.prisma.citizen_registration_request.findUnique({
            where: { registration_reference_number: reference },
        });
        if (!reg)
            throw new common_1.NotFoundException('Registration request not found');
        if (reg.request_status !== 'pending') {
            throw new common_1.BadRequestException('Registration request is not pending');
        }
        const updated = await this.prisma.citizen_registration_request.update({
            where: { registration_reference_number: reference },
            data: {
                request_status: 'rejected',
                rejection_reason: dto.rejectionReason,
                reviewed_at: new Date(),
                reviewed_by: adminNationalId,
            },
        });
        void this.sms.sendRegistrationRejected(reg.phone_number, dto.rejectionReason, reference);
        return updated;
    }
};
exports.RegistrationsService = RegistrationsService;
exports.RegistrationsService = RegistrationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        hashing_service_1.HashingService,
        sms_service_1.SmsService])
], RegistrationsService);
//# sourceMappingURL=registrations.service.js.map