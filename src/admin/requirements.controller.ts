import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { RequirementsService } from './requirements.service';
import { CreateRequirementDto, UpdateRequirementDto } from './dto/create-requirement.dto';

@Controller('admin/requirements')
@UseGuards(AdminJwtGuard)
export class RequirementsController {
  constructor(private readonly svc: RequirementsService) {}

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Post()
  create(@Body() dto: CreateRequirementDto, @CurrentUser() user: JwtPayload) {
    return this.svc.create(dto, user.sub);
  }

  @Patch(':code')
  update(
    @Param('code') code: string,
    @Body() dto: UpdateRequirementDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.svc.update(code, dto, user.sub);
  }

  @Patch(':code/toggle')
  toggle(@Param('code') code: string, @CurrentUser() user: JwtPayload) {
    return this.svc.toggle(code, user.sub);
  }
}
