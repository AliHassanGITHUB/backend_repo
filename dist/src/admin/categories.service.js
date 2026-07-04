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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.category.findMany({ orderBy: { category_id: 'asc' } });
    }
    create(dto, adminNationalId) {
        return this.prisma.category.create({
            data: { category_name: dto.name, created_by: adminNationalId },
        });
    }
    async update(id, dto, adminNationalId) {
        const cat = await this.prisma.category.findUnique({ where: { category_id: id } });
        if (!cat)
            throw new common_1.NotFoundException('Category not found');
        return this.prisma.category.update({
            where: { category_id: id },
            data: { category_name: dto.name, updated_by: adminNationalId },
        });
    }
    async toggle(id, adminNationalId) {
        const cat = await this.prisma.category.findUnique({ where: { category_id: id } });
        if (!cat)
            throw new common_1.NotFoundException('Category not found');
        if (cat.is_active) {
            const hasDoc = await this.prisma.document.findFirst({ where: { category_id: id } });
            if (hasDoc) {
                throw new common_1.ConflictException('Cannot deactivate: one or more documents reference this category');
            }
        }
        return this.prisma.category.update({
            where: { category_id: id },
            data: { is_active: !cat.is_active, updated_by: adminNationalId },
        });
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map