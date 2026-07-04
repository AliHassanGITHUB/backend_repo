import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class MinioService implements OnModuleInit {
    private readonly config;
    private readonly uploadsDir;
    private readonly baseUrl;
    private readonly logger;
    constructor(config: ConfigService);
    onModuleInit(): void;
    uploadFile(buffer: Buffer, key: string, _mimeType: string): Promise<string>;
    getFileUrl(key: string): string;
    getPresignedUrl(key: string, _expirySeconds?: number): Promise<string>;
}
