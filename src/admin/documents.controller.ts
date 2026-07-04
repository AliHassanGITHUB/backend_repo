import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/create-document.dto';

@Controller('admin/documents')
@UseGuards(AdminJwtGuard)
export class DocumentsController {
  constructor(private readonly svc: DocumentsService) {}

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Post()
  create(@Body() dto: CreateDocumentDto, @CurrentUser() user: JwtPayload) {
    return this.svc.create(dto, user.sub);
  }

  @Patch(':code')
  update(
    @Param('code') code: string,
    @Body() dto: UpdateDocumentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.svc.update(code, dto, user.sub);
  }

  @Patch(':code/toggle')
  toggle(@Param('code') code: string, @CurrentUser() user: JwtPayload) {
    return this.svc.toggle(code, user.sub);
  }
}
