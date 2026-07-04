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
exports.CitizenService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const minio_service_1 = require("../minio/minio.service");
const hashing_service_1 = require("../auth/hashing.service");
const verify_service_1 = require("../verify/verify.service");
const IMAGE_MIMES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const DOC_MIMES = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};
let CitizenService = class CitizenService {
    prisma;
    minio;
    hashing;
    verify;
    constructor(prisma, minio, hashing, verify) {
        this.prisma = prisma;
        this.minio = minio;
        this.hashing = hashing;
        this.verify = verify;
    }
    getActiveDocuments() {
        return this.prisma.document.findMany({
            where: { is_active: true },
            include: {
                category: { select: { category_id: true, category_name: true } },
                document_requirement: {
                    include: {
                        requirement: {
                            select: {
                                requirement_code: true,
                                requirement_name: true,
                                requirement_type: true,
                            },
                        },
                    },
                },
            },
            orderBy: { document_code: 'asc' },
        });
    }
    async getDocumentRequirements(documentCode) {
        const doc = await this.prisma.document.findUnique({
            where: { document_code: documentCode, is_active: true },
        });
        if (!doc)
            throw new common_1.NotFoundException('Document not found or inactive');
        const rows = await this.prisma.document_requirement.findMany({
            where: { document_code: documentCode },
            include: {
                requirement: {
                    select: {
                        requirement_code: true,
                        requirement_name: true,
                        requirement_type: true,
                        form_input_kind: true,
                        form_options: true,
                    },
                },
            },
            orderBy: [{ is_mandatory: 'desc' }],
        });
        return rows.map((dr) => ({
            requirement_code: dr.requirement_code,
            requirement_name: dr.requirement.requirement_name,
            requirement_type: dr.requirement.requirement_type,
            form_input_kind: dr.requirement.form_input_kind,
            form_options: dr.requirement.form_options,
            is_mandatory: dr.is_mandatory,
            revealed_by_requirement_code: dr.revealed_by_requirement_code,
            revealed_by_values: dr.revealed_by_values,
        }));
    }
    async submitApplication(nationalId, documentCode, files, formFields) {
        const doc = await this.prisma.document.findUnique({
            where: { document_code: documentCode, is_active: true },
            include: {
                document_requirement: {
                    include: {
                        requirement: {
                            select: {
                                requirement_code: true,
                                requirement_type: true,
                                form_input_kind: true,
                                form_options: true,
                            },
                        },
                    },
                },
            },
        });
        if (!doc)
            throw new common_1.NotFoundException('Document not found or inactive');
        const allDrs = doc.document_requirement;
        const revealed = new Set();
        for (const dr of allDrs) {
            if (dr.is_mandatory || !dr.revealed_by_requirement_code || !dr.revealed_by_values)
                continue;
            const rawAnswer = formFields[dr.revealed_by_requirement_code];
            if (rawAnswer === undefined)
                continue;
            let answer;
            try {
                answer = JSON.parse(rawAnswer);
            }
            catch {
                answer = rawAnswer;
            }
            const allowedValues = dr.revealed_by_values;
            if (allowedValues.includes(answer)) {
                revealed.add(dr.requirement_code);
            }
        }
        const fileFieldnames = new Set(files.map((f) => f.fieldname));
        const missing = [];
        for (const dr of allDrs) {
            const code = dr.requirement_code;
            const type = dr.requirement.requirement_type;
            if (!dr.is_mandatory && !revealed.has(code))
                continue;
            const isFile = type === 'Image' || type === 'PDF document';
            if (isFile && !fileFieldnames.has(code))
                missing.push(code);
            else if (!isFile && !(code in formFields))
                missing.push(code);
        }
        if (missing.length > 0) {
            throw new common_1.BadRequestException(`Missing required fields: ${missing.join(', ')}`);
        }
        for (const dr of allDrs) {
            const code = dr.requirement_code;
            const req = dr.requirement;
            if (req.requirement_type !== 'Form')
                continue;
            if (!dr.is_mandatory && !revealed.has(code))
                continue;
            const rawAnswer = formFields[code];
            if (!rawAnswer)
                continue;
            let parsed;
            try {
                parsed = JSON.parse(rawAnswer);
            }
            catch {
                throw new common_1.BadRequestException(`Invalid JSON for field ${code}`);
            }
            if (req.form_input_kind === 'select') {
                const options = req.form_options;
                if (!options.includes(parsed)) {
                    throw new common_1.BadRequestException(`Invalid value for ${code}: "${parsed}"`);
                }
            }
            else if (req.form_input_kind === 'group') {
                const group = parsed;
                const subFields = req.form_options;
                for (const sf of subFields) {
                    const val = group[sf.name];
                    if (val === undefined || val === null || val === '') {
                        throw new common_1.BadRequestException(`Missing group sub-field "${sf.name}" in ${code}`);
                    }
                    if (sf.kind === 'select' && sf.options && !sf.options.includes(val)) {
                        throw new common_1.BadRequestException(`Invalid value for "${sf.name}" in ${code}`);
                    }
                }
            }
        }
        const app = await this.prisma.application.create({
            data: { citizen_national_id_number: nationalId, document_code: documentCode },
        });
        const responseRows = [];
        for (const file of files) {
            const reqCode = file.fieldname;
            const dr = allDrs.find((r) => r.requirement_code === reqCode);
            if (!dr)
                continue;
            const ext = DOC_MIMES[file.mimetype] ?? 'jpg';
            const key = `applications/${app.application_id}/${reqCode}-${(0, crypto_1.randomUUID)()}.${ext}`;
            const url = await this.minio.uploadFile(file.buffer, key, file.mimetype);
            responseRows.push({
                application_id: app.application_id,
                requirement_code: reqCode,
                is_mandatory: dr.is_mandatory || revealed.has(reqCode),
                attachment_url: url,
            });
        }
        for (const [code, rawValue] of Object.entries(formFields)) {
            const dr = allDrs.find((r) => r.requirement_code === code);
            if (!dr)
                continue;
            let parsed;
            try {
                parsed = JSON.parse(rawValue);
            }
            catch {
                parsed = rawValue;
            }
            responseRows.push({
                application_id: app.application_id,
                requirement_code: code,
                is_mandatory: dr.is_mandatory || revealed.has(code),
                field_value: parsed,
            });
        }
        if (responseRows.length > 0) {
            await this.prisma.application_response.createMany({ data: responseRows });
        }
        return this.prisma.application.findUnique({
            where: { application_id: app.application_id },
            include: {
                document: {
                    select: {
                        document_code: true,
                        document_name: true,
                        document_description: true,
                        fees: true,
                        processing_days: true,
                        category: { select: { category_name: true } },
                    },
                },
                application_response: true,
            },
        });
    }
    getMyApplications(nationalId) {
        return this.prisma.application.findMany({
            where: { citizen_national_id_number: nationalId },
            include: {
                document: {
                    select: {
                        document_code: true,
                        document_name: true,
                        document_description: true,
                        fees: true,
                        processing_days: true,
                        category: { select: { category_name: true } },
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async getProfile(nationalId) {
        const citizen = await this.prisma.citizen.findUnique({
            where: { citizen_national_id_number: nationalId },
            select: {
                citizen_national_id_number: true,
                citizen_first_name: true,
                citizen_father_name: true,
                citizen_last_name: true,
                mother_first_name: true,
                mother_last_name: true,
                date_of_birth: true,
                place_of_birth: true,
                gender: true,
                phone_number: true,
                photo_url: true,
                id_card_copy_url: true,
                name_index_copy_url: true,
                citizen_username: true,
                is_active: true,
                created_at: true,
            },
        });
        if (!citizen)
            throw new common_1.NotFoundException('Citizen not found');
        return citizen;
    }
    async updatePhone(nationalId, dto) {
        const verified = await this.verify.check(dto.newPhoneNumber, dto.otpCode);
        if (!verified)
            throw new common_1.BadRequestException('Invalid or expired verification code');
        return this.prisma.citizen.update({
            where: { citizen_national_id_number: nationalId },
            data: { phone_number: dto.newPhoneNumber },
            select: { phone_number: true },
        });
    }
    async updateCredentials(nationalId, dto) {
        if (!dto.username && !dto.newPassword) {
            throw new common_1.BadRequestException('Provide at least username or newPassword');
        }
        const citizen = await this.prisma.citizen.findUnique({
            where: { citizen_national_id_number: nationalId },
        });
        if (!citizen)
            throw new common_1.NotFoundException('Citizen not found');
        const valid = await this.hashing.verify(citizen.citizen_password, dto.currentPassword);
        if (!valid)
            throw new common_1.UnauthorizedException('Current password is incorrect');
        const updates = {};
        if (dto.username && dto.username !== citizen.citizen_username) {
            const taken = await this.prisma.citizen.findUnique({
                where: { citizen_username: dto.username },
            });
            if (taken)
                throw new common_1.ConflictException('Username already taken');
            updates.citizen_username = dto.username;
        }
        if (dto.newPassword) {
            updates.citizen_password = await this.hashing.hash(dto.newPassword);
        }
        if (Object.keys(updates).length === 0) {
            return { citizen_username: citizen.citizen_username };
        }
        return this.prisma.citizen.update({
            where: { citizen_national_id_number: nationalId },
            data: updates,
            select: { citizen_username: true },
        });
    }
    async uploadPhoto(nationalId, file) {
        if (!IMAGE_MIMES.has(file.mimetype)) {
            throw new common_1.BadRequestException('Photo must be jpg, png, or webp');
        }
        const ext = file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : 'jpg';
        const key = `citizens/${nationalId}/photo-${(0, crypto_1.randomUUID)()}.${ext}`;
        const photoUrl = await this.minio.uploadFile(file.buffer, key, file.mimetype);
        await this.prisma.citizen.update({
            where: { citizen_national_id_number: nationalId },
            data: { photo_url: photoUrl },
        });
        return { photoUrl };
    }
    async uploadIdCard(nationalId, file) {
        const ext = DOC_MIMES[file.mimetype];
        if (!ext)
            throw new common_1.BadRequestException('ID card must be pdf, jpg, jpeg, png, or webp');
        const key = `citizens/${nationalId}/idcard-${(0, crypto_1.randomUUID)()}.${ext}`;
        const idCardUrl = await this.minio.uploadFile(file.buffer, key, file.mimetype);
        await this.prisma.citizen.update({
            where: { citizen_national_id_number: nationalId },
            data: { id_card_copy_url: idCardUrl, name_index_copy_url: null },
        });
        return { idCardUrl };
    }
    async uploadNameIndex(nationalId, file) {
        const ext = DOC_MIMES[file.mimetype];
        if (!ext)
            throw new common_1.BadRequestException('Name index must be pdf, jpg, jpeg, png, or webp');
        const key = `citizens/${nationalId}/nameindex-${(0, crypto_1.randomUUID)()}.${ext}`;
        const nameIndexUrl = await this.minio.uploadFile(file.buffer, key, file.mimetype);
        await this.prisma.citizen.update({
            where: { citizen_national_id_number: nationalId },
            data: { name_index_copy_url: nameIndexUrl, id_card_copy_url: null },
        });
        return { nameIndexUrl };
    }
};
exports.CitizenService = CitizenService;
exports.CitizenService = CitizenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        minio_service_1.MinioService,
        hashing_service_1.HashingService,
        verify_service_1.VerifyService])
], CitizenService);
//# sourceMappingURL=citizen.service.js.map