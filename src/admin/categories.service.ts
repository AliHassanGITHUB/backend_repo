import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({ orderBy: { category_id: 'asc' } });
  }

  create(dto: CreateCategoryDto, adminNationalId: string) {
    return this.prisma.category.create({
      data: { category_name: dto.name, created_by: adminNationalId },
    });
  }

  async update(id: number, dto: CreateCategoryDto, adminNationalId: string) {
    const cat = await this.prisma.category.findUnique({ where: { category_id: id } });
    if (!cat) throw new NotFoundException('Category not found');
    return this.prisma.category.update({
      where: { category_id: id },
      data: { category_name: dto.name, updated_by: adminNationalId },
    });
  }

  async toggle(id: number, adminNationalId: string) {
    const cat = await this.prisma.category.findUnique({ where: { category_id: id } });
    if (!cat) throw new NotFoundException('Category not found');

    if (cat.is_active) {
      const hasDoc = await this.prisma.document.findFirst({ where: { category_id: id } });
      if (hasDoc) {
        throw new ConflictException(
          'Cannot deactivate: one or more documents reference this category',
        );
      }
    }

    return this.prisma.category.update({
      where: { category_id: id },
      data: { is_active: !cat.is_active, updated_by: adminNationalId },
    });
  }
}
