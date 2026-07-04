import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { RegistrationsService } from './registrations.service';
import { RejectDto } from './dto/reject.dto';

@Controller('admin/registrations')
@UseGuards(AdminJwtGuard)
export class RegistrationsController {
  constructor(private readonly svc: RegistrationsService) {}

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get(':reference')
  findOne(@Param('reference') reference: string) {
    return this.svc.findOne(reference);
  }

  @Post(':reference/approve')
  approve(@Param('reference') reference: string, @CurrentUser() user: JwtPayload) {
    return this.svc.approve(reference, user.sub);
  }

  @Post(':reference/reject')
  reject(
    @Param('reference') reference: string,
    @Body() dto: RejectDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.svc.reject(reference, dto, user.sub);
  }
}
