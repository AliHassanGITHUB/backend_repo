import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { HashingService } from '../auth/hashing.service';
import { VerifyService } from '../verify/verify.service';
import { UpdatePhoneDto } from './dto/update-phone.dto';
import { UpdateCredentialsDto } from './dto/update-credentials.dto';
export declare class CitizenService {
    private readonly prisma;
    private readonly minio;
    private readonly hashing;
    private readonly verify;
    constructor(prisma: PrismaService, minio: MinioService, hashing: HashingService, verify: VerifyService);
    getActiveDocuments(): Prisma.PrismaPromise<({
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
            revealed_by_values: Prisma.JsonValue | null;
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
        fees: Prisma.Decimal;
        processing_days: number;
    })[]>;
    getDocumentRequirements(documentCode: string): Promise<{
        requirement_code: string;
        requirement_name: string;
        requirement_type: string;
        form_input_kind: string | null;
        form_options: Prisma.JsonValue;
        is_mandatory: boolean;
        revealed_by_requirement_code: string | null;
        revealed_by_values: Prisma.JsonValue;
    }[]>;
    submitApplication(nationalId: string, documentCode: string, files: Express.Multer.File[], formFields: Record<string, string>): Promise<({
        document: {
            category: {
                category_name: string;
            };
            document_code: string;
            document_name: string;
            document_description: string;
            fees: Prisma.Decimal;
            processing_days: number;
        };
        application_response: {
            created_at: Date;
            requirement_code: string;
            is_mandatory: boolean;
            application_id: number;
            attachment_url: string | null;
            field_value: Prisma.JsonValue | null;
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
    getMyApplications(nationalId: string): Prisma.PrismaPromise<({
        document: {
            category: {
                category_name: string;
            };
            document_code: string;
            document_name: string;
            document_description: string;
            fees: Prisma.Decimal;
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
    getProfile(nationalId: string): Promise<{
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
    updatePhone(nationalId: string, dto: UpdatePhoneDto): Promise<{
        phone_number: string;
    }>;
    updateCredentials(nationalId: string, dto: UpdateCredentialsDto): Promise<{
        citizen_username: string;
    }>;
    uploadPhoto(nationalId: string, file: Express.Multer.File): Promise<{
        photoUrl: string;
    }>;
    uploadIdCard(nationalId: string, file: Express.Multer.File): Promise<{
        idCardUrl: string;
    }>;
    uploadNameIndex(nationalId: string, file: Express.Multer.File): Promise<{
        nameIndexUrl: string;
    }>;
}
