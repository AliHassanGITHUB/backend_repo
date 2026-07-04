import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        created_at: Date;
        is_active: boolean;
        created_by: string;
        category_id: number;
        category_name: string;
        updated_at: Date | null;
        updated_by: string | null;
    }[]>;
    create(dto: CreateCategoryDto, adminNationalId: string): import(".prisma/client").Prisma.Prisma__categoryClient<{
        created_at: Date;
        is_active: boolean;
        created_by: string;
        category_id: number;
        category_name: string;
        updated_at: Date | null;
        updated_by: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: number, dto: CreateCategoryDto, adminNationalId: string): Promise<{
        created_at: Date;
        is_active: boolean;
        created_by: string;
        category_id: number;
        category_name: string;
        updated_at: Date | null;
        updated_by: string | null;
    }>;
    toggle(id: number, adminNationalId: string): Promise<{
        created_at: Date;
        is_active: boolean;
        created_by: string;
        category_id: number;
        category_name: string;
        updated_at: Date | null;
        updated_by: string | null;
    }>;
}
