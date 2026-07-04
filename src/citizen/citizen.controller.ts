import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { CitizenJwtGuard } from '../auth/guards/citizen-jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CitizenService } from './citizen.service';
import { UpdatePhoneDto } from './dto/update-phone.dto';
import { UpdateCredentialsDto } from './dto/update-credentials.dto';

@Controller('citizen')
@UseGuards(CitizenJwtGuard)
export class CitizenController {
  constructor(private readonly svc: CitizenService) {}

  @Get('documents')
  getDocuments() {
    return this.svc.getActiveDocuments();
  }

  @Get('documents/:code/requirements')
  getDocumentRequirements(@Param('code') code: string) {
    return this.svc.getDocumentRequirements(code);
  }

  @Post('applications')
  @UseInterceptors(AnyFilesInterceptor())
  submitApplication(
    @Body() body: Record<string, string>,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: JwtPayload,
  ) {
    const { documentCode, ...formFields } = body;
    if (!documentCode) throw new BadRequestException('documentCode is required');
    return this.svc.submitApplication(user.sub, documentCode, files ?? [], formFields);
  }

  @Get('applications')
  getMyApplications(@CurrentUser() user: JwtPayload) {
    return this.svc.getMyApplications(user.sub);
  }

  @Get('profile')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.svc.getProfile(user.sub);
  }

  @Patch('phone')
  updatePhone(@Body() dto: UpdatePhoneDto, @CurrentUser() user: JwtPayload) {
    return this.svc.updatePhone(user.sub, dto);
  }

  @Patch('profile/credentials')
  updateCredentials(@Body() dto: UpdateCredentialsDto, @CurrentUser() user: JwtPayload) {
    return this.svc.updateCredentials(user.sub, dto);
  }

  @Post('profile/photo')
  @UseInterceptors(FileInterceptor('photo'))
  uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!file) throw new BadRequestException('photo file is required');
    return this.svc.uploadPhoto(user.sub, file);
  }

  @Post('profile/id-card')
  @UseInterceptors(FileInterceptor('idCard'))
  uploadIdCard(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!file) throw new BadRequestException('idCard file is required');
    return this.svc.uploadIdCard(user.sub, file);
  }

  @Post('profile/name-index')
  @UseInterceptors(FileInterceptor('nameIndex'))
  uploadNameIndex(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!file) throw new BadRequestException('nameIndex file is required');
    return this.svc.uploadNameIndex(user.sub, file);
  }
}
