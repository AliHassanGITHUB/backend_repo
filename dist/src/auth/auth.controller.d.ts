import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { CitizenLoginDto } from './dto/citizen-login.dto';
import { CitizenRegisterDto } from './dto/citizen-register.dto';
import { TrackRegistrationDto } from './dto/track-registration.dto';
import { ForgotPasswordStartDto } from './dto/forgot-password-start.dto';
import { ForgotPasswordResetDto } from './dto/forgot-password-reset.dto';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    adminLogin(dto: AdminLoginDto): Promise<{
        accessToken: string;
    }>;
    citizenLogin(dto: CitizenLoginDto): Promise<{
        accessToken: string;
    }>;
    citizenRegister(dto: CitizenRegisterDto, files: {
        photo?: Express.Multer.File[];
        idCopy?: Express.Multer.File[];
        nameIndex?: Express.Multer.File[];
    }): Promise<{
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
    forgotPasswordStart(dto: ForgotPasswordStartDto): Promise<{
        message: string;
    }>;
    forgotPasswordReset(dto: ForgotPasswordResetDto): Promise<{
        reset: boolean;
    }>;
}
