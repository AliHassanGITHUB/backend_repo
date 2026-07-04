import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
export declare class CategoriesController {
    private readonly svc;
    constructor(svc: CategoriesService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        created_at: Date;
        is_active: boolean;
        created_by: string;
        category_id: number;
        category_name: string;
        updated_at: Date | null;
        updated_by: string | null;
    }[]>;
    create(dto: CreateCategoryDto, user: JwtPayload): import(".prisma/client").Prisma.Prisma__categoryClient<{
        created_at: Date;
        is_active: boolean;
        created_by: string;
        category_id: number;
        category_name: string;
        updated_at: Date | null;
        updated_by: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: number, dto: CreateCategoryDto, user: JwtPayload): Promise<{
        created_at: Date;
        is_active: boolean;
        created_by: string;
        category_id: number;
        category_name: string;
        updated_at: Date | null;
        updated_by: string | null;
    }>;
    toggle(id: number, user: JwtPayload): Promise<{
        created_at: Date;
        is_active: boolean;
        created_by: string;
        category_id: number;
        category_name: string;
        updated_at: Date | null;
        updated_by: string | null;
    }>;
}
