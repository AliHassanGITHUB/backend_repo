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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const admin_jwt_guard_1 = require("../auth/guards/admin-jwt.guard");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardController = class DashboardController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getKpis() {
        const [categories, documents, underReview, citizens, pendingRegistrations, pendingPayment, recentApplicationsRaw, recentRegistrationsRaw, activeDocumentsRaw,] = await Promise.all([
            this.prisma.category.count({ where: { is_active: true } }),
            this.prisma.document.count({ where: { is_active: true } }),
            this.prisma.application.count({ where: { application_status: 'under review' } }),
            this.prisma.citizen.count({ where: { is_active: true } }),
            this.prisma.citizen_registration_request.count({ where: { request_status: 'pending' } }),
            this.prisma.application.count({ where: { application_status: 'approved and pending payment' } }),
            this.prisma.application.findMany({
                where: { application_status: 'under review' },
                include: {
                    citizen: { select: { citizen_first_name: true, citizen_last_name: true, citizen_national_id_number: true } },
                    document: { select: { document_name: true, document_code: true } },
                },
                orderBy: { created_at: 'desc' },
                take: 6,
            }),
            this.prisma.citizen_registration_request.findMany({
                orderBy: { created_at: 'desc' },
                take: 5,
            }),
            this.prisma.document.findMany({
                where: { is_active: true },
                select: { document_code: true, document_name: true },
                take: 8,
            }),
        ]);
        const recentApplications = recentApplicationsRaw.map((a) => ({
            id: a.application_id,
            status: a.application_status,
            created_at: a.created_at,
            citizen: {
                first_name: a.citizen.citizen_first_name,
                last_name: a.citizen.citizen_last_name,
                national_id: a.citizen.citizen_national_id_number,
            },
            document: { name: a.document.document_name, code: a.document.document_code },
        }));
        const recentRegistrations = recentRegistrationsRaw.map((r) => ({
            id: r.registration_reference_number,
            first_name: r.citizen_first_name,
            last_name: r.citizen_last_name,
            national_id: r.citizen_national_id_number,
            created_at: r.created_at,
        }));
        const activeDocuments = activeDocumentsRaw.map((d) => ({
            code: d.document_code,
            name: d.document_name,
        }));
        return {
            categories,
            documents,
            underReview,
            citizens,
            pendingRegistrations,
            pendingPayment,
            recentApplications,
            recentRegistrations,
            activeDocuments,
        };
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getKpis", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('admin/dashboard'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map