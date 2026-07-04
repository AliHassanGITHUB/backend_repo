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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DocumentsService = class DocumentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.document.findMany({
            include: {
                category: { select: { category_id: true, category_name: true } },
                document_requirement: {
                    include: { requirement: true },
                },
            },
            orderBy: { document_code: 'asc' },
        });
    }
    async create(dto, adminNationalId) {
        const category = await this.prisma.category.findUnique({ where: { category_id: dto.categoryId } });
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        return this.prisma.$transaction(async (tx) => {
            const doc = await tx.document.create({
                data: {
                    document_code: dto.code,
                    document_name: dto.name,
                    document_description: dto.description,
                    fees: dto.fees,
                    processing_days: dto.processingDays,
                    category_id: dto.categoryId,
                    created_by: adminNationalId,
                },
            });
            if (dto.requirements?.length) {
                for (const r of dto.requirements) {
                    const req = await tx.requirement.findUnique({ where: { requirement_code: r.code } });
                    if (!req)
                        throw new common_1.NotFoundException(`Requirement ${r.code} not found`);
                    await tx.document_requirement.create({
                        data: {
                            document_code: doc.document_code,
                            requirement_code: r.code,
                            is_mandatory: r.isMandatory,
                            created_by: adminNationalId,
                        },
                    });
                }
            }
            return tx.document.findUnique({
                where: { document_code: doc.document_code },
                include: { document_requirement: { include: { requirement: true } } },
            });
        });
    }
    async update(code, dto, adminNationalId) {
        const doc = await this.prisma.document.findUnique({ where: { document_code: code } });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        if (dto.categoryId !== undefined) {
            const cat = await this.prisma.category.findUnique({ where: { category_id: dto.categoryId } });
            if (!cat)
                throw new common_1.NotFoundException('Category not found');
        }
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.document.update({
                where: { document_code: code },
                data: {
                    ...(dto.name && { document_name: dto.name }),
                    ...(dto.description !== undefined && { document_description: dto.description }),
                    ...(dto.fees !== undefined && { fees: dto.fees }),
                    ...(dto.processingDays !== undefined && { processing_days: dto.processingDays }),
                    ...(dto.categoryId !== undefined && { category_id: dto.categoryId }),
                    updated_by: adminNationalId,
                },
            });
            if (dto.requirements !== undefined) {
                await tx.document_requirement.deleteMany({ where: { document_code: code } });
                for (const r of dto.requirements) {
                    const req = await tx.requirement.findUnique({ where: { requirement_code: r.code } });
                    if (!req)
                        throw new common_1.NotFoundException(`Requirement ${r.code} not found`);
                    await tx.document_requirement.create({
                        data: {
                            document_code: code,
                            requirement_code: r.code,
                            is_mandatory: r.isMandatory,
                            created_by: adminNationalId,
                        },
                    });
                }
            }
            return tx.document.findUnique({
                where: { document_code: updated.document_code },
                include: { document_requirement: { include: { requirement: true } } },
            });
        });
    }
    async toggle(code, adminNationalId) {
        const doc = await this.prisma.document.findUnique({ where: { document_code: code } });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        return this.prisma.document.update({
            where: { document_code: code },
            data: { is_active: !doc.is_active, updated_by: adminNationalId },
        });
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map