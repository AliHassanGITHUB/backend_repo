import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { HashingService } from '../auth/hashing.service';
import { VerifyService } from '../verify/verify.service';
import { UpdatePhoneDto } from './dto/update-phone.dto';
import { UpdateCredentialsDto } from './dto/update-credentials.dto';

const IMAGE_MIMES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

const DOC_MIMES: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Injectable()
export class CitizenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
    private readonly hashing: HashingService,
    private readonly verify: VerifyService,
  ) {}

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

  async getDocumentRequirements(documentCode: string) {
    const doc = await this.prisma.document.findUnique({
      where: { document_code: documentCode, is_active: true },
    });
    if (!doc) throw new NotFoundException('Document not found or inactive');

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

  async submitApplication(
    nationalId: string,
    documentCode: string,
    files: Express.Multer.File[],
    formFields: Record<string, string>,
  ) {
    // 1. Load document + requirements with reveal rules
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
    if (!doc) throw new NotFoundException('Document not found or inactive');

    const allDrs = doc.document_requirement;

    // 2. Determine which situational requirements are revealed by the submitted form answers
    const revealed = new Set<string>();
    for (const dr of allDrs) {
      if (dr.is_mandatory || !dr.revealed_by_requirement_code || !dr.revealed_by_values) continue;
      const rawAnswer = formFields[dr.revealed_by_requirement_code];
      if (rawAnswer === undefined) continue;
      let answer: unknown;
      try { answer = JSON.parse(rawAnswer); } catch { answer = rawAnswer; }
      const allowedValues = dr.revealed_by_values as string[];
      if (allowedValues.includes(answer as string)) {
        revealed.add(dr.requirement_code);
      }
    }

    // 3. Validate all mandatory + revealed requirements are present
    const fileFieldnames = new Set(files.map((f) => f.fieldname));
    const missing: string[] = [];
    for (const dr of allDrs) {
      const code = dr.requirement_code;
      const type = dr.requirement.requirement_type;
      if (!dr.is_mandatory && !revealed.has(code)) continue;
      const isFile = type === 'Image' || type === 'PDF document';
      if (isFile && !fileFieldnames.has(code)) missing.push(code);
      else if (!isFile && !(code in formFields)) missing.push(code);
    }
    if (missing.length > 0) {
      throw new BadRequestException(`Missing required fields: ${missing.join(', ')}`);
    }

    // 4. Validate select / group values
    for (const dr of allDrs) {
      const code = dr.requirement_code;
      const req = dr.requirement;
      if (req.requirement_type !== 'Form') continue;
      if (!dr.is_mandatory && !revealed.has(code)) continue;
      const rawAnswer = formFields[code];
      if (!rawAnswer) continue;
      let parsed: unknown;
      try { parsed = JSON.parse(rawAnswer); } catch {
        throw new BadRequestException(`Invalid JSON for field ${code}`);
      }
      if (req.form_input_kind === 'select') {
        const options = req.form_options as string[];
        if (!options.includes(parsed as string)) {
          throw new BadRequestException(`Invalid value for ${code}: "${parsed as string}"`);
        }
      } else if (req.form_input_kind === 'group') {
        const group = parsed as Record<string, unknown>;
        const subFields = req.form_options as Array<{ name: string; kind: string; options?: string[] }>;
        for (const sf of subFields) {
          const val = group[sf.name];
          if (val === undefined || val === null || (val as string) === '') {
            throw new BadRequestException(`Missing group sub-field "${sf.name}" in ${code}`);
          }
          if (sf.kind === 'select' && sf.options && !sf.options.includes(val as string)) {
            throw new BadRequestException(`Invalid value for "${sf.name}" in ${code}`);
          }
        }
      }
    }

    // 5. Create application
    const app = await this.prisma.application.create({
      data: { citizen_national_id_number: nationalId, document_code: documentCode },
    });

    // 6. Upload files and build application_response rows
    const responseRows: Prisma.application_responseCreateManyInput[] = [];

    for (const file of files) {
      const reqCode = file.fieldname;
      const dr = allDrs.find((r) => r.requirement_code === reqCode);
      if (!dr) continue;
      const ext = DOC_MIMES[file.mimetype] ?? 'jpg';
      const key = `applications/${app.application_id}/${reqCode}-${randomUUID()}.${ext}`;
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
      if (!dr) continue;
      let parsed: Prisma.InputJsonValue;
      try { parsed = JSON.parse(rawValue) as Prisma.InputJsonValue; } catch { parsed = rawValue; }
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

  getMyApplications(nationalId: string) {
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

  async getProfile(nationalId: string) {
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
    if (!citizen) throw new NotFoundException('Citizen not found');
    return citizen;
  }

  async updatePhone(nationalId: string, dto: UpdatePhoneDto) {
    // The code must have gone to the NEW number — that's what proves the
    // citizen controls it, not just that they typed it correctly.
    const verified = await this.verify.check(dto.newPhoneNumber, dto.otpCode);
    if (!verified) throw new BadRequestException('Invalid or expired verification code');

    return this.prisma.citizen.update({
      where: { citizen_national_id_number: nationalId },
      data: { phone_number: dto.newPhoneNumber },
      select: { phone_number: true },
    });
  }

  async updateCredentials(nationalId: string, dto: UpdateCredentialsDto) {
    if (!dto.username && !dto.newPassword) {
      throw new BadRequestException('Provide at least username or newPassword');
    }

    const citizen = await this.prisma.citizen.findUnique({
      where: { citizen_national_id_number: nationalId },
    });
    if (!citizen) throw new NotFoundException('Citizen not found');

    const valid = await this.hashing.verify(citizen.citizen_password, dto.currentPassword);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    const updates: Record<string, string> = {};

    if (dto.username && dto.username !== citizen.citizen_username) {
      const taken = await this.prisma.citizen.findUnique({
        where: { citizen_username: dto.username },
      });
      if (taken) throw new ConflictException('Username already taken');
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

  async uploadPhoto(nationalId: string, file: Express.Multer.File) {
    if (!IMAGE_MIMES.has(file.mimetype)) {
      throw new BadRequestException('Photo must be jpg, png, or webp');
    }
    const ext = file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : 'jpg';
    const key = `citizens/${nationalId}/photo-${randomUUID()}.${ext}`;
    const photoUrl = await this.minio.uploadFile(file.buffer, key, file.mimetype);
    await this.prisma.citizen.update({
      where: { citizen_national_id_number: nationalId },
      data: { photo_url: photoUrl },
    });
    return { photoUrl };
  }

  async uploadIdCard(nationalId: string, file: Express.Multer.File) {
    const ext = DOC_MIMES[file.mimetype];
    if (!ext) throw new BadRequestException('ID card must be pdf, jpg, jpeg, png, or webp');
    const key = `citizens/${nationalId}/idcard-${randomUUID()}.${ext}`;
    const idCardUrl = await this.minio.uploadFile(file.buffer, key, file.mimetype);
    await this.prisma.citizen.update({
      where: { citizen_national_id_number: nationalId },
      data: { id_card_copy_url: idCardUrl, name_index_copy_url: null },
    });
    return { idCardUrl };
  }

  async uploadNameIndex(nationalId: string, file: Express.Multer.File) {
    const ext = DOC_MIMES[file.mimetype];
    if (!ext) throw new BadRequestException('Name index must be pdf, jpg, jpeg, png, or webp');
    const key = `citizens/${nationalId}/nameindex-${randomUUID()}.${ext}`;
    const nameIndexUrl = await this.minio.uploadFile(file.buffer, key, file.mimetype);
    await this.prisma.citizen.update({
      where: { citizen_national_id_number: nationalId },
      data: { name_index_copy_url: nameIndexUrl, id_card_copy_url: null },
    });
    return { nameIndexUrl };
  }
}
