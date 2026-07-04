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
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const sms_service_1 = require("../sms/sms.service");
let ApplicationsService = class ApplicationsService {
    prisma;
    sms;
    constructor(prisma, sms) {
        this.prisma = prisma;
        this.sms = sms;
    }
    findAll() {
        return this.prisma.application.findMany({
            include: {
                citizen: {
                    select: {
                        citizen_national_id_number: true,
                        citizen_first_name: true,
                        citizen_last_name: true,
                        photo_url: true,
                    },
                },
                document: { select: { document_code: true, document_name: true, fees: true } },
            },
            orderBy: { application_id: 'asc' },
        });
    }
    async findOne(id) {
        const app = await this.prisma.application.findUnique({
            where: { application_id: id },
            include: {
                citizen: true,
                document: true,
                application_response: {
                    include: { requirement: true },
                },
            },
        });
        if (!app)
            throw new common_1.NotFoundException('Application not found');
        return app;
    }
    async approve(id, adminNationalId) {
        const app = await this.prisma.application.findUnique({
            where: { application_id: id },
            include: { citizen: true },
        });
        if (!app)
            throw new common_1.NotFoundException('Application not found');
        if (app.application_status !== 'under review') {
            throw new common_1.BadRequestException('Application is not under review');
        }
        const reference = `APP-00${id}`;
        const updated = await this.prisma.application.update({
            where: { application_id: id },
            data: {
                application_status: 'approved and pending payment',
                application_reference_number: reference,
                reviewed_at: new Date(),
                reviewed_by: adminNationalId,
            },
        });
        void this.sms.sendApplicationApproved(app.citizen.phone_number);
        return updated;
    }
    async reject(id, dto, adminNationalId) {
        const app = await this.prisma.application.findUnique({
            where: { application_id: id },
            include: { citizen: true },
        });
        if (!app)
            throw new common_1.NotFoundException('Application not found');
        if (app.application_status !== 'under review') {
            throw new common_1.BadRequestException('Application is not under review');
        }
        const updated = await this.prisma.application.update({
            where: { application_id: id },
            data: {
                application_status: 'rejected',
                rejection_reason: dto.rejectionReason,
                reviewed_at: new Date(),
                reviewed_by: adminNationalId,
            },
        });
        void this.sms.sendApplicationRejected(app.citizen.phone_number, dto.rejectionReason);
        return updated;
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        sms_service_1.SmsService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map