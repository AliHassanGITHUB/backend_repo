import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CitizenService } from './citizen.service';
import { UpdatePhoneDto } from './dto/update-phone.dto';
import { UpdateCredentialsDto } from './dto/update-credentials.dto';
export declare class CitizenController {
    private readonly svc;
    constructor(svc: CitizenService);
    getDocuments(): import(".prisma/client").Prisma.PrismaPromise<({
        category: {
            category_id: number;
            category_name: string;
        };
        document_requirement: ({
            requirement: {
                requirement_code: string;
                requirement_name: string;
                requirement_type: string;
            };
        } & {
            created_at: Date;
            created_by: string;
            updated_at: Date | null;
            updated_by: string | null;
            document_code: string;
            requirement_code: string;
            is_mandatory: boolean;
            revealed_by_requirement_code: string | null;
            revealed_by_values: import("@prisma/client/runtime/client").JsonValue | null;
        })[];
    } & {
        created_at: Date;
        is_active: boolean;
        created_by: string;
        category_id: number;
        updated_at: Date | null;
        updated_by: string | null;
        document_code: string;
        document_name: string;
        document_description: string;
        fees: import("@prisma/client-runtime-utils").Decimal;
        processing_days: number;
    })[]>;
    getDocumentRequirements(code: string): Promise<{
        requirement_code: string;
        requirement_name: string;
        requirement_type: string;
        form_input_kind: string | null;
        form_options: import("@prisma/client/runtime/client").JsonValue;
        is_mandatory: boolean;
        revealed_by_requirement_code: string | null;
        revealed_by_values: import("@prisma/client/runtime/client").JsonValue;
    }[]>;
    submitApplication(body: Record<string, string>, files: Express.Multer.File[], user: JwtPayload): Promise<({
        document: {
            category: {
                category_name: string;
            };
            document_code: string;
            document_name: string;
            document_description: string;
            fees: import("@prisma/client-runtime-utils").Decimal;
            processing_days: number;
        };
        application_response: {
            created_at: Date;
            requirement_code: string;
            is_mandatory: boolean;
            application_id: number;
            attachment_url: string | null;
            field_value: import("@prisma/client/runtime/client").JsonValue | null;
        }[];
    } & {
        created_at: Date;
        citizen_national_id_number: string;
        rejection_reason: string | null;
        reviewed_at: Date | null;
        reviewed_by: string | null;
        document_code: string;
        application_id: number;
        application_status: string;
        application_reference_number: string | null;
        completed_at: Date | null;
    }) | null>;
    getMyApplications(user: JwtPayload): import(".prisma/client").Prisma.PrismaPromise<({
        document: {
            category: {
                category_name: string;
            };
            document_code: string;
            document_name: string;
            document_description: string;
            fees: import("@prisma/client-runtime-utils").Decimal;
            processing_days: number;
        };
    } & {
        created_at: Date;
        citizen_national_id_number: string;
        rejection_reason: string | null;
        reviewed_at: Date | null;
        reviewed_by: string | null;
        document_code: string;
        application_id: number;
        application_status: string;
        application_reference_number: string | null;
        completed_at: Date | null;
    })[]>;
    getProfile(user: JwtPayload): Promise<{
        gender: string;
        created_at: Date;
        citizen_national_id_number: string;
        citizen_first_name: string;
        citizen_father_name: string;
        citizen_last_name: string;
        mother_first_name: string;
        mother_last_name: string;
        date_of_birth: Date;
        place_of_birth: string;
        phone_number: string;
        photo_url: string;
        id_card_copy_url: string | null;
        name_index_copy_url: string | null;
        citizen_username: string;
        is_active: boolean;
    }>;
    updatePhone(dto: UpdatePhoneDto, user: JwtPayload): Promise<{
        phone_number: string;
    }>;
    updateCredentials(dto: UpdateCredentialsDto, user: JwtPayload): Promise<{
        citizen_username: string;
    }>;
    uploadPhoto(file: Express.Multer.File, user: JwtPayload): Promise<{
        photoUrl: string;
    }>;
    uploadIdCard(file: Express.Multer.File, user: JwtPayload): Promise<{
        idCardUrl: string;
    }>;
    uploadNameIndex(file: Express.Multer.File, user: JwtPayload): Promise<{
        nameIndexUrl: string;
    }>;
}
