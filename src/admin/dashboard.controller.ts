import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin/dashboard')
@UseGuards(AdminJwtGuard)
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getKpis() {
    const [
      categories,
      documents,
      underReview,
      citizens,
      pendingRegistrations,
      pendingPayment,
      recentApplicationsRaw,
      recentRegistrationsRaw,
      activeDocumentsRaw,
    ] = await Promise.all([
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
}
