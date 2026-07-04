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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const minio_service_1 = require("../minio/minio.service");
const hashing_service_1 = require("./hashing.service");
const verify_service_1 = require("../verify/verify.service");
const constants_1 = require("../common/constants");
const PHOTO_MIMES = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};
const DOC_MIMES = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};
let AuthService = class AuthService {
    prisma;
    hashing;
    jwt;
    minio;
    verify;
    constructor(prisma, hashing, jwt, minio, verify) {
        this.prisma = prisma;
        this.hashing = hashing;
        this.jwt = jwt;
        this.minio = minio;
        this.verify = verify;
    }
    async adminLogin(dto) {
        const admin = await this.prisma.administrator.findFirst({
            where: {
                admin_national_id_number: dto.adminNationalId,
                admin_code: dto.adminCode,
            },
        });
        if (!admin)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const valid = await this.hashing.verify(admin.admin_password, dto.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const accessToken = await this.jwt.signAsync({
            sub: admin.admin_national_id_number,
            role: 'admin',
        });
        return { accessToken };
    }
    async citizenLogin(dto) {
        const citizen = await this.prisma.citizen.findFirst({
            where: {
                citizen_national_id_number: dto.nationalId,
                citizen_username: dto.username,
            },
        });
        if (!citizen)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (!citizen.is_active)
            throw new common_1.UnauthorizedException('Account is inactive');
        const valid = await this.hashing.verify(citizen.citizen_password, dto.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const accessToken = await this.jwt.signAsync({
            sub: citizen.citizen_national_id_number,
            role: 'citizen',
        });
        return { accessToken };
    }
    async citizenRegister(dto, photoFile, idCopyFile, nameIndexFile) {
        const photoExt = PHOTO_MIMES[photoFile.mimetype];
        if (!photoExt)
            throw new common_1.BadRequestException('Photo must be jpg, png, or webp');
        if (idCopyFile) {
            const ext = DOC_MIMES[idCopyFile.mimetype];
            if (!ext)
                throw new common_1.BadRequestException('ID copy must be pdf, jpg, jpeg, png, or webp');
        }
        if (nameIndexFile) {
            const ext = DOC_MIMES[nameIndexFile.mimetype];
            if (!ext)
                throw new common_1.BadRequestException('Name index must be pdf, jpg, jpeg, png, or webp');
        }
        const dob = new Date(dto.dateOfBirth);
        const nationalIdYear = Number(dto.nationalId.slice(4, 8));
        if (nationalIdYear !== dob.getUTCFullYear()) {
            throw new common_1.BadRequestException('National ID year must match the year of birth');
        }
        const eighteenYearsAgo = new Date();
        eighteenYearsAgo.setUTCFullYear(eighteenYearsAgo.getUTCFullYear() - 18);
        if (dob > eighteenYearsAgo || dob < new Date('1900-01-01')) {
            throw new common_1.BadRequestException('Citizen must be at least 18 years old and born on or after 1900-01-01');
        }
        const pendingCount = await this.prisma.citizen_registration_request.count({
            where: { citizen_national_id_number: dto.nationalId, request_status: 'pending' },
        });
        if (pendingCount > 0)
            throw new common_1.ConflictException('A pending registration already exists for this national ID');
        const verified = await this.verify.check(dto.phoneNumber, dto.otpCode);
        if (!verified)
            throw new common_1.BadRequestException('Invalid or expired verification code');
        const totalCount = await this.prisma.citizen_registration_request.count({
            where: { citizen_national_id_number: dto.nationalId },
        });
        const counter = totalCount + 1;
        const nineDigits = dto.nationalId.replace(/[^0-9]/g, '');
        const referenceNumber = `REG-${nineDigits}-00${counter}`;
        const uid = (0, crypto_1.randomUUID)();
        const photoKey = `registrations/${dto.nationalId}/photo-${uid}.${photoExt}`;
        const uploadTasks = [
            this.minio.uploadFile(photoFile.buffer, photoKey, photoFile.mimetype),
        ];
        let docUploadIndex = -1;
        let docType;
        if (idCopyFile) {
            const idExt = DOC_MIMES[idCopyFile.mimetype];
            const idKey = `registrations/${dto.nationalId}/idcopy-${uid}.${idExt}`;
            docUploadIndex = uploadTasks.length;
            docType = 'idCopy';
            uploadTasks.push(this.minio.uploadFile(idCopyFile.buffer, idKey, idCopyFile.mimetype));
        }
        else if (nameIndexFile) {
            const nameIdxExt = DOC_MIMES[nameIndexFile.mimetype];
            const nameIdxKey = `registrations/${dto.nationalId}/nameindex-${uid}.${nameIdxExt}`;
            docUploadIndex = uploadTasks.length;
            docType = 'nameIndex';
            uploadTasks.push(this.minio.uploadFile(nameIndexFile.buffer, nameIdxKey, nameIndexFile.mimetype));
        }
        const results = await Promise.all(uploadTasks);
        const photoUrl = results[0];
        const docUrl = docUploadIndex >= 0 ? results[docUploadIndex] : undefined;
        await this.prisma.citizen_registration_request.create({
            data: {
                registration_reference_number: referenceNumber,
                citizen_national_id_number: dto.nationalId,
                citizen_first_name: dto.firstName,
                citizen_father_name: dto.fatherName,
                citizen_last_name: dto.lastName,
                mother_first_name: dto.motherFirstName,
                mother_last_name: dto.motherLastName,
                date_of_birth: new Date(dto.dateOfBirth),
                place_of_birth: dto.placeOfBirth,
                gender: dto.gender,
                phone_number: dto.phoneNumber,
                photo_url: photoUrl,
                id_card_copy_url: docType === 'idCopy' ? docUrl : null,
                name_index_copy_url: docType === 'nameIndex' ? docUrl : null,
            },
        });
        return { referenceNumber };
    }
    async trackRegistration(dto) {
        const reg = await this.prisma.citizen_registration_request.findUnique({
            where: { registration_reference_number: dto.referenceNumber },
        });
        if (!reg || reg.citizen_national_id_number !== dto.nationalId) {
            throw new common_1.NotFoundException("This request doesn't exist");
        }
        if (reg.request_status === 'approved') {
            const citizen = await this.prisma.citizen.findUnique({
                where: { citizen_national_id_number: reg.citizen_national_id_number },
            });
            return {
                status: reg.request_status,
                username: citizen?.citizen_username,
                password: constants_1.DEFAULT_CITIZEN_PASSWORD,
            };
        }
        return {
            status: reg.request_status,
            rejectionReason: reg.rejection_reason,
        };
    }
    findCitizenByIdentifier(identifier) {
        return this.prisma.citizen.findFirst({
            where: {
                OR: [
                    { citizen_national_id_number: identifier },
                    { citizen_username: identifier },
                ],
            },
        });
    }
    async forgotPasswordStart(dto) {
        const citizen = await this.findCitizenByIdentifier(dto.identifier);
        if (citizen) {
            await this.verify.start(citizen.phone_number).catch(() => undefined);
        }
        return { message: 'If an account exists, a code has been sent.' };
    }
    async forgotPasswordReset(dto) {
        const citizen = await this.findCitizenByIdentifier(dto.identifier);
        const verified = citizen ? await this.verify.check(citizen.phone_number, dto.otpCode) : false;
        if (!verified)
            throw new common_1.BadRequestException('Invalid or expired code');
        const hashedPassword = await this.hashing.hash(dto.newPassword);
        await this.prisma.citizen.update({
            where: { citizen_national_id_number: citizen.citizen_national_id_number },
            data: { citizen_password: hashedPassword },
        });
        return { reset: true };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        hashing_service_1.HashingService,
        jwt_1.JwtService,
        minio_service_1.MinioService,
        verify_service_1.VerifyService])
], AuthService);
//# sourceMappingURL=auth.service.js.map