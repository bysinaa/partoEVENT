import {
  Injectable, Controller, Get, Post, Patch, Delete, Param, Query, Body,
  UseGuards, HttpCode, HttpStatus, NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

// ─── Service ────────────────────────────────
@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  async findAll({ page = 1, limit = 20, search }: { page: number; limit: number; search?: string }) {
    const where: any = {};
    if (search) {
      where.OR = [
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameFa: { contains: search, mode: 'insensitive' } },
        { positionEn: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.teamMember.findMany({
        where, orderBy: { order: 'asc' },
        skip: (page - 1) * limit, take: limit,
      }),
      this.prisma.teamMember.count({ where }),
    ]);
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const item = await this.prisma.teamMember.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Team member not found');
    return item;
  }

  private mapDto(dto: any) {
    const data: any = {};
    if (dto.nameEn !== undefined) data.nameEn = dto.nameEn;
    if (dto.nameFa !== undefined) data.nameFa = dto.nameFa;
    if (dto.positionEn !== undefined) data.positionEn = dto.positionEn;
    if (dto.positionFa !== undefined) data.positionFa = dto.positionFa;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.order !== undefined) data.order = dto.order;
    if (dto.bioEn !== undefined) data.biographyEn = dto.bioEn;
    if (dto.bioFa !== undefined) data.biographyFa = dto.bioFa;
    if (dto.biographyEn !== undefined) data.biographyEn = dto.biographyEn;
    if (dto.biographyFa !== undefined) data.biographyFa = dto.biographyFa;
    if (dto.image !== undefined) data.photoId = dto.image || null;
    if (dto.photoId !== undefined) data.photoId = dto.photoId || null;
    if (dto.instagram !== undefined) data.instagram = dto.instagram;
    if (dto.linkedin !== undefined) data.linkedin = dto.linkedin;
    if (dto.twitter !== undefined) data.twitter = dto.twitter;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    return data;
  }

  async create(dto: any) {
    return this.prisma.teamMember.create({ data: this.mapDto(dto) });
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    return this.prisma.teamMember.update({ where: { id }, data: this.mapDto(dto) });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.teamMember.delete({ where: { id } });
  }
}

// ─── Controller ─────────────────────────────
@ApiTags('Team')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('team')
export class TeamController {
  constructor(private service: TeamService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string, @Query('search') search?: string) {
    return this.service.findAll({ page: +(page || '1'), limit: +(limit || '20'), search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  create(@Body() dto: any) { return this.service.create(dto); }

  @Patch(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  update(@Param('id') id: string, @Body() dto: any) { return this.service.update(id, dto); }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) { return this.service.remove(id); }
}