import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly uploadsDir: string;
  private readonly baseUrl: string;
  private readonly logger = new Logger(MinioService.name);

  constructor(private readonly config: ConfigService) {
    const port = config.get<string>('PORT') ?? '3000';
    this.uploadsDir = path.resolve(process.cwd(), 'uploads');
    this.baseUrl = `http://localhost:${port}/uploads`;
  }

  onModuleInit() {
    fs.mkdirSync(this.uploadsDir, { recursive: true });
    this.logger.log(`Local file storage ready at: ${this.uploadsDir}`);
  }

  async uploadFile(buffer: Buffer, key: string, _mimeType: string): Promise<string> {
    const dest = path.join(this.uploadsDir, key);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    await fs.promises.writeFile(dest, buffer);
    return this.getFileUrl(key);
  }

  getFileUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }

  // Kept for interface compatibility — returns a direct URL (no expiry)
  getPresignedUrl(key: string, _expirySeconds = 3600): Promise<string> {
    return Promise.resolve(this.getFileUrl(key));
  }
}
