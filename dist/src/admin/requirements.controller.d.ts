import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { RequirementsService } from './requirements.service';
import { CreateRequirementDto, UpdateRequirementDto } from './dto/create-requirement.dto';
export declare class RequirementsController {
    private readonly svc;
    constructor(svc: RequirementsService);
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
    create(dto: CreateRequirementDto, user: JwtPayload): Promise<{
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
    update(code: string, dto: UpdateRequirementDto, user: JwtPayload): Promise<{
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
    toggle(code: string, user: JwtPayload): Promise<{
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
