import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getKpis(): Promise<{
        categories: number;
        documents: number;
        underReview: number;
        citizens: number;
        pendingRegistrations: number;
        pendingPayment: number;
        recentApplications: {
            id: number;
            status: string;
            created_at: Date;
            citizen: {
                first_name: string;
                last_name: string;
                national_id: string;
            };
            document: {
                name: string;
                code: string;
            };
        }[];
        recentRegistrations: {
            id: string;
            first_name: string;
            last_name: string;
            national_id: string;
            created_at: Date;
        }[];
        activeDocuments: {
            code: string;
            name: string;
        }[];
    }>;
}
