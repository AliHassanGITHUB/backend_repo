import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { ApplicationsService } from './applications.service';
import { RejectDto } from './dto/reject.dto';
export declare class ApplicationsController {
    private readonly svc;
    constructor(svc: ApplicationsService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        citizen: {
            citizen_national_id_number: string;
            citizen_first_name: string;
            citizen_last_name: string;
            photo_url: string;
        };
        document: {
            document_code: string;
            document_name: string;
            fees: import("@prisma/client-runtime-utils").Decimal;
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
    findOne(id: number): Promise<{
        citizen: {
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
            citizen_password: string;
            is_active: boolean;
            created_by: string;
        };
        document: {
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
        };
        application_response: ({
            requirement: {
                created_at: Date;
                is_active: boolean;
                created_by: string;
                updated_at: Date | null;
                updated_by: string | null;
                requirement_code: string;
                requirement_name: string;
                requirement_type: string;
                form_input_kind: string | null;
                form_options: import("@prisma/client/runtime/client").JsonValue | null;
            };
        } & {
            created_at: Date;
            requirement_code: string;
            is_mandatory: boolean;
            application_id: number;
            attachment_url: string | null;
            field_value: import("@prisma/client/runtime/client").JsonValue | null;
        })[];
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
    }>;
    approve(id: number, user: JwtPayload): Promise<{
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
    }>;
    reject(id: number, dto: RejectDto, user: JwtPayload): Promise<{
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
    }>;
}
