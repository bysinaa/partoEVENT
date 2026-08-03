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
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll({ page = 1, limit = 20, search, type }: { page: number; limit: number; search?: string; type?: string }) {
    const where: any = {};
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameFa: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.category.findMany({
        where, orderBy: { order: 'asc' },
        skip: (page - 1) * limit, take: limit,
        include: { _count: { select: { posts: true } } },
      }),
      this.prisma.category.count({ where }),
    ]);
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const item = await this.prisma.category.findUnique({ where: { id }, include: { posts: true } });
    if (!item) throw new NotFoundException('Category not found');
    return item;
  }

  async create(dto: any) {
    const slug = dto.slug || slugify(dto.nameEn || '');
    const existing = slug ? await this.prisma.category.findUnique({ where: { slug } }) : null;
    if (existing) throw new ConflictException('Slug already exists');
    return this.prisma.category.create({ data: { ...dto, ...(slug && { slug }) } });
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.category.delete({ where: { id } });
  }
}

// ─── Controller ─────────────────────────────
@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private service: CategoriesService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string,
    @Query('search') search?: string, @Query('type') type?: string) {
    return this.service.findAll({ page: +(page || '1'), limit: +(limit || '20'), search, type });
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