import { PrismaService } from '../prisma/prisma.service';
import { CreateRequirementDto, UpdateRequirementDto } from './dto/create-requirement.dto';
export declare class RequirementsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
    create(dto: CreateRequirementDto, adminNationalId: string): Promise<{
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
    }>;
    update(code: string, dto: UpdateRequirementDto, adminNationalId: string): Promise<{
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
    }>;
    toggle(code: string, adminNationalId: string): Promise<{
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
    }>;
}
