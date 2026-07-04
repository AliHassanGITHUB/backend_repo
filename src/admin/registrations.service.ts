import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HashingService } from '../auth/hashing.service';
import { SmsService } from '../sms/sms.service';
import { RejectDto } from './dto/reject.dto';
import { DEFAULT_CITIZEN_PASSWORD } from '../common/constants';

@Injectable()
export class RegistrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashing: HashingService,
    private readonly sms: SmsService,
  ) {}

  findAll() {
    return this.prisma.citizen_registration_request.findMany({
      orderBy: [{ request_status: 'asc' }, { created_at: 'desc' }],
    });
  }

  async findOne(reference: string) {
    const reg = await this.prisma.citizen_registration_request.findUnique({
      where: { registration_reference_number: reference },
    });
    if (!reg) throw new NotFoundException('Registration request not found');
    return reg;
  }

  async approve(reference: string, adminNationalId: string) {
    const reg = await this.prisma.citizen_registration_request.findUnique({
      where: { registration_reference_number: reference },
    });
    if (!reg) throw new NotFoundException('Registration request not found');
    if (reg.request_status !== 'pending') {
      throw new BadRequestException('Registration request is not pending');
    }

    const nationalId = reg.citizen_national_id_number;
    const digits = nationalId.replace(/\D/g, '').slice(0, 9).padStart(9, '0');
    const firstName = (reg.citizen_first_name ?? '').toLowerCase().replace(/[^a-z]/g, '') || 'user';
    const username = `${firstName}.${digits}`;

    const plainPassword = DEFAULT_CITIZEN_PASSWORD;
    const hashedPassword = await this.hashing.hash(plainPassword);

    await this.prisma.$transaction(async (tx) => {
      await tx.citizen.create({
        data: {
          citizen_national_id_number: nationalId,
          citizen_first_name: reg.citizen_first_name,
          citizen_father_name: reg.citizen_father_name,
          citizen_last_name: reg.citizen_last_name,
          mother_first_name: reg.mother_first_name,
          mother_last_name: reg.mother_last_name,
          date_of_birth: reg.date_of_birth,
          place_of_birth: reg.place_of_birth,
          gender: reg.gender,
          phone_number: reg.phone_number,
          photo_url: reg.photo_url,
          id_card_copy_url: reg.id_card_copy_url,
          name_index_copy_url: reg.name_index_copy_url,
          citizen_username: username,
          citizen_password: hashedPassword,
          is_active: true,
          created_by: adminNationalId,
        },
      });

      await tx.citizen_registration_request.update({
        where: { registration_reference_number: reference },
        data: {
          request_status: 'approved',
          reviewed_at: new Date(),
          reviewed_by: adminNationalId,
        },
      });
    });

    // Best-effort SMS — fire after transaction succeeds
    void this.sms.sendRegistrationApproved(reg.phone_number, reference);

    // Plain password returned ONCE — admin delivers it to citizen out-of-band
    return { username, plainPassword, reference };
  }

  async reject(reference: string, dto: RejectDto, adminNationalId: string) {
    const reg = await this.prisma.citizen_registration_request.findUnique({
      where: { registration_reference_number: reference },
    });
    if (!reg) throw new NotFoundException('Registration request not found');
    if (reg.request_status !== 'pending') {
      throw new BadRequestException('Registration request is not pending');
    }

    const updated = await this.prisma.citizen_registration_request.update({
      where: { registration_reference_number: reference },
      data: {
        request_status: 'rejected',
        rejection_reason: dto.rejectionReason,
        reviewed_at: new Date(),
        reviewed_by: adminNationalId,
      },
    });

    void this.sms.sendRegistrationRejected(reg.phone_number, dto.rejectionReason, reference);

    return updated;
  }

}
