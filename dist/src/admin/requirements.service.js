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
exports.RequirementsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RequirementsService = class RequirementsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.requirement.findMany({ orderBy: { requirement_code: 'asc' } });
    }
    async create(dto, adminNationalId) {
        const existing = await this.prisma.requirement.findUnique({ where: { requirement_code: dto.code } });
        if (existing)
            throw new common_1.ConflictException(`Requirement code ${dto.code} already exists`);
        return this.prisma.requirement.create({
            data: {
                requirement_code: dto.code,
                requirement_name: dto.name,
                requirement_type: dto.type,
                created_by: adminNationalId,
            },
        });
    }
    async update(code, dto, adminNationalId) {
        const req = await this.prisma.requirement.findUnique({ where: { requirement_code: code } });
        if (!req)
            throw new common_1.NotFoundException('Requirement not found');
        return this.prisma.requirement.update({
            where: { requirement_code: code },
            data: {
                ...(dto.name && { requirement_name: dto.name }),
                ...(dto.type && { requirement_type: dto.type }),
                updated_by: adminNationalId,
            },
        });
    }
    async toggle(code, adminNationalId) {
        const req = await this.prisma.requirement.findUnique({ where: { requirement_code: code } });
        if (!req)
            throw new common_1.NotFoundException('Requirement not found');
        if (req.is_active) {
            const linked = await this.prisma.document_requirement.findFirst({
                where: { requirement_code: code },
            });
            if (linked) {
                throw new common_1.ConflictException('Cannot deactivate: this requirement is linked to one or more documents');
            }
        }
        return this.prisma.requirement.update({
            where: { requirement_code: code },
            data: { is_active: !req.is_active, updated_by: adminNationalId },
        });
    }
};
exports.RequirementsService = RequirementsService;
exports.RequirementsService = RequirementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RequirementsService);
//# sourceMappingURL=requirements.service.js.map