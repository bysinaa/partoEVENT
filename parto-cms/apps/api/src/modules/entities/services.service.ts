import {
  Injectable, Controller, Get, Post, Patch, Delete, Param, Query, Body,
  UseGuards, HttpCode, HttpStatus, NotFoundException, ConflictException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// ─── Service ────────────────────────────────
@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll({ page = 1, limit = 20, search, status }: { page: number; limit: number; search?: string; status?: string }) {
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { titleEn: { contains: search, mode: 'insensitive' } },
        { titleFa: { contains: search, mode: 'insensitive' } },
        { descriptionEn: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.service.findMany({
        where, orderBy: { order: 'asc' },
        skip: (page - 1) * limit, take: limit,
      }),
      this.prisma.service.count({ where }),
    ]);
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const item = await this.prisma.service.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Service not found');
    return item;
  }

  private mapDto(dto: any) {
    const data: any = {};
    for (const [key, val] of Object.entries(dto)) {
      if (key === 'icon') { data.iconId = val; continue; }
      if (key === 'image') { data.coverImageId = val; continue; }
      data[key] = val;
    }
    return data;
  }

  async create(dto: any) {
    const slug = dto.slug || slugify(dto.titleEn || '');
    const existing = slug ? await this.prisma.service.findUnique({ where: { slug } }) : null;
    if (existing) throw new ConflictException('Slug already exists');
    return this.prisma.service.create({ data: { ...this.mapDto(dto), ...(slug && { slug }) } });
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    return this.prisma.service.update({ where: { id }, data: this.mapDto(dto) });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.service.delete({ where: { id } });
  }
}

// ─── Controller ─────────────────────────────
@ApiTags('Services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('services')
export class ServicesController {
  constructor(private service: ServicesService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string,
    @Query('search') search?: string, @Query('status') status?: string) {
    return this.service.findAll({ page: +(page || '1'), limit: +(limit || '20'), search, status });
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