import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { RequirementsService } from './requirements.service';
import { RequirementsController } from './requirements.controller';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { RegistrationsService } from './registrations.service';
import { RegistrationsController } from './registrations.controller';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    DashboardController,
    CategoriesController,
    RequirementsController,
    DocumentsController,
    ApplicationsController,
    RegistrationsController,
  ],
  providers: [
    CategoriesService,
    RequirementsService,
    DocumentsService,
    ApplicationsService,
    RegistrationsService,
  ],
})
export class AdminModule {}
