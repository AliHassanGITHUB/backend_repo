import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequirementDto, UpdateRequirementDto } from './dto/create-requirement.dto';

@Injectable()
export class RequirementsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.requirement.findMany({ orderBy: { requirement_code: 'asc' } });
  }

  async create(dto: CreateRequirementDto, adminNationalId: string) {
    const existing = await this.prisma.requirement.findUnique({ where: { requirement_code: dto.code } });
    if (existing) throw new ConflictException(`Requirement code ${dto.code} already exists`);

    return this.prisma.requirement.create({
      data: {
        requirement_code: dto.code,
        requirement_name: dto.name,
        requirement_type: dto.type,
        created_by: adminNationalId,
      },
    });
  }

  async update(code: string, dto: UpdateRequirementDto, adminNationalId: string) {
    const req = await this.prisma.requirement.findUnique({ where: { requirement_code: code } });
    if (!req) throw new NotFoundException('Requirement not found');
    return this.prisma.requirement.update({
      where: { requirement_code: code },
      data: {
        ...(dto.name && { requirement_name: dto.name }),
        ...(dto.type && { requirement_type: dto.type }),
        updated_by: adminNationalId,
      },
    });
  }

  async toggle(code: string, adminNationalId: string) {
    const req = await this.prisma.requirement.findUnique({ where: { requirement_code: code } });
    if (!req) throw new NotFoundException('Requirement not found');

    if (req.is_active) {
      const linked = await this.prisma.document_requirement.findFirst({
        where: { requirement_code: code },
      });
      if (linked) {
        throw new ConflictException(
          'Cannot deactivate: this requirement is linked to one or more documents',
        );
      }
    }

    return this.prisma.requirement.update({
      where: { requirement_code: code },
      data: { is_active: !req.is_active, updated_by: adminNationalId },
    });
  }
}
