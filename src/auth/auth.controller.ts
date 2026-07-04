import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { CitizenLoginDto } from './dto/citizen-login.dto';
import { CitizenRegisterDto } from './dto/citizen-register.dto';
import { TrackRegistrationDto } from './dto/track-registration.dto';
import { ForgotPasswordStartDto } from './dto/forgot-password-start.dto';
import { ForgotPasswordResetDto } from './dto/forgot-password-reset.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('admin/login')
  adminLogin(@Body() dto: AdminLoginDto) {
    return this.auth.adminLogin(dto);
  }

  @Post('citizen/login')
  citizenLogin(@Body() dto: CitizenLoginDto) {
    return this.auth.citizenLogin(dto);
  }

  @Post('citizen/register')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'photo', maxCount: 1 },
      { name: 'idCopy', maxCount: 1 },
      { name: 'nameIndex', maxCount: 1 },
    ]),
  )
  citizenRegister(
    @Body() dto: CitizenRegisterDto,
    @UploadedFiles()
    files: {
      photo?: Express.Multer.File[];
      idCopy?: Express.Multer.File[];
      nameIndex?: Express.Multer.File[];
    },
  ) {
    const photo     = files?.photo?.[0];
    const idCopy    = files?.idCopy?.[0];
    const nameIndex = files?.nameIndex?.[0];
    if (!photo) throw new BadRequestException('photo file is required');
    if (idCopy && nameIndex)
      throw new BadRequestException('Provide either idCopy or nameIndex, not both');
    if (!idCopy && !nameIndex)
      throw new BadRequestException('Either idCopy or nameIndex is required');
    return this.auth.citizenRegister(dto, photo, idCopy, nameIndex);
  }

  @Post('citizen/registration-status')
  trackRegistration(@Body() dto: TrackRegistrationDto) {
    return this.auth.trackRegistration(dto);
  }

  @Post('citizen/forgot-password/start')
  forgotPasswordStart(@Body() dto: ForgotPasswordStartDto) {
    return this.auth.forgotPasswordStart(dto);
  }

  @Post('citizen/forgot-password/reset')
  forgotPasswordReset(@Body() dto: ForgotPasswordResetDto) {
    return this.auth.forgotPasswordReset(dto);
  }
}
