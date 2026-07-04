import { JwtService } from '@nestjs/jwt';
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
export declare class AuthService {
    private readonly prisma;
    private readonly hashing;
    private readonly jwt;
    private readonly minio;
    private readonly verify;
    constructor(prisma: PrismaService, hashing: HashingService, jwt: JwtService, minio: MinioService, verify: VerifyService);
    adminLogin(dto: AdminLoginDto): Promise<{
        accessToken: string;
    }>;
    citizenLogin(dto: CitizenLoginDto): Promise<{
        accessToken: string;
    }>;
    citizenRegister(dto: CitizenRegisterDto, photoFile: Express.Multer.File, idCopyFile: Express.Multer.File | undefined, nameIndexFile: Express.Multer.File | undefined): Promise<{
        referenceNumber: string;
    }>;
    trackRegistration(dto: TrackRegistrationDto): Promise<{
        status: string;
        username: string | undefined;
        password: string;
        rejectionReason?: undefined;
    } | {
        status: string;
        rejectionReason: string | null;
        username?: undefined;
        password?: undefined;
    }>;
    private findCitizenByIdentifier;
    forgotPasswordStart(dto: ForgotPasswordStartDto): Promise<{
        message: string;
    }>;
    forgotPasswordReset(dto: ForgotPasswordResetDto): Promise<{
        reset: boolean;
    }>;
}
