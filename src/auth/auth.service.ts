import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { HashingService } from './hashing.service';
import { VerifyService } from '../verify/verify.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { CitizenLoginDto } from './dto/citizen-login.dto';
import { CitizenRegisterDto } from './dto/citizen-register.dto';
import { TrackRegistrationDto } from './dto/track-registration.dto';
import { ForgotPasswordStartDto } from './dto/forgot-password-start.dto';
import { ForgotPasswordResetDto } from './dto/forgot-password-reset.dto';
import { DEFAULT_CITIZEN_PASSWORD } from '../common/constants';

const PHOTO_MIMES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

// ID card and name index accept PDF and common image formats
const DOC_MIMES: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashing: HashingService,
    private readonly jwt: JwtService,
    private readonly minio: MinioService,
    private readonly verify: VerifyService,
  ) {}

  async adminLogin(dto: AdminLoginDto) {
    const admin = await this.prisma.administrator.findFirst({
      where: {
        admin_national_id_number: dto.adminNationalId,
        admin_code: dto.adminCode,
      },
    });
    if (!admin) throw new UnauthorizedException('Invalid credentials');

    const valid = await this.hashing.verify(admin.admin_password, dto.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.jwt.signAsync({
      sub: admin.admin_national_id_number,
      role: 'admin',
    });
    return { accessToken };
  }

  async citizenLogin(dto: CitizenLoginDto) {
    const citizen = await this.prisma.citizen.findFirst({
      where: {
        citizen_national_id_number: dto.nationalId,
        citizen_username: dto.username,
      },
    });
    if (!citizen) throw new UnauthorizedException('Invalid credentials');
    if (!citizen.is_active) throw new UnauthorizedException('Account is inactive');

    const valid = await this.hashing.verify(citizen.citizen_password, dto.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.jwt.signAsync({
      sub: citizen.citizen_national_id_number,
      role: 'citizen',
    });
    return { accessToken };
  }

  async citizenRegister(
    dto: CitizenRegisterDto,
    photoFile: Express.Multer.File,
    idCopyFile: Express.Multer.File | undefined,
    nameIndexFile: Express.Multer.File | undefined,
  ) {
    const photoExt = PHOTO_MIMES[photoFile.mimetype];
    if (!photoExt) throw new BadRequestException('Photo must be jpg, png, or webp');

    // Validate whichever document was provided (XOR enforced by controller)
    if (idCopyFile) {
      const ext = DOC_MIMES[idCopyFile.mimetype];
      if (!ext) throw new BadRequestException('ID copy must be pdf, jpg, jpeg, png, or webp');
    }
    if (nameIndexFile) {
      const ext = DOC_MIMES[nameIndexFile.mimetype];
      if (!ext) throw new BadRequestException('Name index must be pdf, jpg, jpeg, png, or webp');
    }

    // Mirrors CHK_Citizen_National_ID_Birth_Year_Consistency / Date_Of_Birth —
    // checked here (cheap, before Verify) so a mismatch never wastes the OTP code.
    const dob = new Date(dto.dateOfBirth);
    const nationalIdYear = Number(dto.nationalId.slice(4, 8));
    if (nationalIdYear !== dob.getUTCFullYear()) {
      throw new BadRequestException('National ID year must match the year of birth');
    }
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setUTCFullYear(eighteenYearsAgo.getUTCFullYear() - 18);
    if (dob > eighteenYearsAgo || dob < new Date('1900-01-01')) {
      throw new BadRequestException('Citizen must be at least 18 years old and born on or after 1900-01-01');
    }

    const pendingCount = await this.prisma.citizen_registration_request.count({
      where: { citizen_national_id_number: dto.nationalId, request_status: 'pending' },
    });
    if (pendingCount > 0)
      throw new ConflictException('A pending registration already exists for this national ID');

    // Server-side gate: no row is ever inserted without a passed Verify check —
    // there is no phone_verified column, the row's existence IS the proof.
    const verified = await this.verify.check(dto.phoneNumber, dto.otpCode);
    if (!verified) throw new BadRequestException('Invalid or expired verification code');

    const totalCount = await this.prisma.citizen_registration_request.count({
      where: { citizen_national_id_number: dto.nationalId },
    });
    const counter = totalCount + 1;
    const nineDigits = dto.nationalId.replace(/[^0-9]/g, '');
    const referenceNumber = `REG-${nineDigits}-00${counter}`;

    const uid = randomUUID();
    const photoKey = `registrations/${dto.nationalId}/photo-${uid}.${photoExt}`;

    // Build upload promises in parallel
    const uploadTasks: Promise<string>[] = [
      this.minio.uploadFile(photoFile.buffer, photoKey, photoFile.mimetype),
    ];

    let docUploadIndex = -1;
    let docType: 'idCopy' | 'nameIndex' | undefined;

    if (idCopyFile) {
      const idExt = DOC_MIMES[idCopyFile.mimetype]!;
      const idKey = `registrations/${dto.nationalId}/idcopy-${uid}.${idExt}`;
      docUploadIndex = uploadTasks.length;
      docType = 'idCopy';
      uploadTasks.push(this.minio.uploadFile(idCopyFile.buffer, idKey, idCopyFile.mimetype));
    } else if (nameIndexFile) {
      const nameIdxExt = DOC_MIMES[nameIndexFile.mimetype]!;
      const nameIdxKey = `registrations/${dto.nationalId}/nameindex-${uid}.${nameIdxExt}`;
      docUploadIndex = uploadTasks.length;
      docType = 'nameIndex';
      uploadTasks.push(this.minio.uploadFile(nameIndexFile.buffer, nameIdxKey, nameIndexFile.mimetype));
    }

    const results = await Promise.all(uploadTasks);
    const photoUrl = results[0];
    const docUrl   = docUploadIndex >= 0 ? results[docUploadIndex] : undefined;

    await this.prisma.citizen_registration_request.create({
      data: {
        registration_reference_number: referenceNumber,
        citizen_national_id_number: dto.nationalId,
        citizen_first_name: dto.firstName,
        citizen_father_name: dto.fatherName,
        citizen_last_name: dto.lastName,
        mother_first_name: dto.motherFirstName,
        mother_last_name: dto.motherLastName,
        date_of_birth: new Date(dto.dateOfBirth),
        place_of_birth: dto.placeOfBirth,
        gender: dto.gender,
        phone_number: dto.phoneNumber,
        photo_url: photoUrl,
        id_card_copy_url: docType === 'idCopy' ? docUrl : null,
        name_index_copy_url: docType === 'nameIndex' ? docUrl : null,
      },
    });

    return { referenceNumber };
  }

  async trackRegistration(dto: TrackRegistrationDto) {
    const reg = await this.prisma.citizen_registration_request.findUnique({
      where: { registration_reference_number: dto.referenceNumber },
    });
    if (!reg || reg.citizen_national_id_number !== dto.nationalId) {
      throw new NotFoundException("This request doesn't exist");
    }

    if (reg.request_status === 'approved') {
      const citizen = await this.prisma.citizen.findUnique({
        where: { citizen_national_id_number: reg.citizen_national_id_number },
      });
      return {
        status: reg.request_status,
        username: citizen?.citizen_username,
        password: DEFAULT_CITIZEN_PASSWORD,
      };
    }

    return {
      status: reg.request_status,
      rejectionReason: reg.rejection_reason,
    };
  }

  private findCitizenByIdentifier(identifier: string) {
    return this.prisma.citizen.findFirst({
      where: {
        OR: [
          { citizen_national_id_number: identifier },
          { citizen_username: identifier },
        ],
      },
    });
  }

  async forgotPasswordStart(dto: ForgotPasswordStartDto) {
    const citizen = await this.findCitizenByIdentifier(dto.identifier);
    const result = citizen
      ? await this.verify.start(citizen.phone_number).catch(() => undefined)
      : {};
    return {
      message: 'If an account exists, a code has been sent.',
      ...result,
    };
  }

  async forgotPasswordReset(dto: ForgotPasswordResetDto) {
    // newPassword strength (DTO @MinLength) is already enforced before this method runs,
    // so a weak password never consumes a Verify code.
    const citizen = await this.findCitizenByIdentifier(dto.identifier);
    const verified = citizen ? await this.verify.check(citizen.phone_number, dto.otpCode) : false;
    if (!verified) throw new BadRequestException('Invalid or expired code');

    const hashedPassword = await this.hashing.hash(dto.newPassword);
    await this.prisma.citizen.update({
      where: { citizen_national_id_number: citizen!.citizen_national_id_number },
      data: { citizen_password: hashedPassword },
    });

    return { reset: true };
  }
}
