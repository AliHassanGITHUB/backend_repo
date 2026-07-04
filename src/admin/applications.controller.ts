import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { ApplicationsService } from './applications.service';
import { RejectDto } from './dto/reject.dto';

@Controller('admin/applications')
@UseGuards(AdminJwtGuard)
export class ApplicationsController {
  constructor(private readonly svc: ApplicationsService) {}

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Post(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    return this.svc.approve(id, user.sub);
  }

  @Post(':id/reject')
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.svc.reject(id, dto, user.sub);
  }
}
