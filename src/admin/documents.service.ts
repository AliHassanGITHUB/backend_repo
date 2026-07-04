import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/create-document.dto';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async create(dto: CreateDocumentDto, adminNationalId: string) {
    const category = await this.prisma.category.findUnique({ where: { category_id: dto.categoryId } });
    if (!category) throw new NotFoundException('Category not found');

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
          if (!req) throw new NotFoundException(`Requirement ${r.code} not found`);
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

  async update(code: string, dto: UpdateDocumentDto, adminNationalId: string) {
    const doc = await this.prisma.document.findUnique({ where: { document_code: code } });
    if (!doc) throw new NotFoundException('Document not found');

    if (dto.categoryId !== undefined) {
      const cat = await this.prisma.category.findUnique({ where: { category_id: dto.categoryId } });
      if (!cat) throw new NotFoundException('Category not found');
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
          if (!req) throw new NotFoundException(`Requirement ${r.code} not found`);
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

  async toggle(code: string, adminNationalId: string) {
    const doc = await this.prisma.document.findUnique({ where: { document_code: code } });
    if (!doc) throw new NotFoundException('Document not found');

    return this.prisma.document.update({
      where: { document_code: code },
      data: { is_active: !doc.is_active, updated_by: adminNationalId },
    });
  }
}
