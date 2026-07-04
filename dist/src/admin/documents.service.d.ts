import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/create-document.dto';
export declare class DocumentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        category: {
            category_id: number;
            category_name: string;
        };
        document_requirement: ({
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
    create(dto: CreateDocumentDto, adminNationalId: string): Promise<({
        document_requirement: ({
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
    }) | null>;
    update(code: string, dto: UpdateDocumentDto, adminNationalId: string): Promise<({
        document_requirement: ({
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
    }) | null>;
    toggle(code: string, adminNationalId: string): Promise<{
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
    }>;
}
