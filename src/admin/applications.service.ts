import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from '../sms/sms.service';
import { RejectDto } from './dto/reject.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sms: SmsService,
  ) {}

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

  async findOne(id: number) {
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
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  async approve(id: number, adminNationalId: string) {
    const app = await this.prisma.application.findUnique({
      where: { application_id: id },
      include: { citizen: true },
    });
    if (!app) throw new NotFoundException('Application not found');
    if (app.application_status !== 'under review') {
      throw new BadRequestException('Application is not under review');
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

  async reject(id: number, dto: RejectDto, adminNationalId: string) {
    const app = await this.prisma.application.findUnique({
      where: { application_id: id },
      include: { citizen: true },
    });
    if (!app) throw new NotFoundException('Application not found');
    if (app.application_status !== 'under review') {
      throw new BadRequestException('Application is not under review');
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
}
