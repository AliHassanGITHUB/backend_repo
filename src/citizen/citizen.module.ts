import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MinioModule } from '../minio/minio.module';
import { CitizenService } from './citizen.service';
import { CitizenController } from './citizen.controller';

@Module({
  imports: [PrismaModule, MinioModule, AuthModule],
  controllers: [CitizenController],
  providers: [CitizenService],
})
export class CitizenModule {}
