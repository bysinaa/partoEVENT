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
  const base = (text || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return base || `client-${Date.now()}`;
}

// ─── Service ────────────────────────────────
@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll({ page = 1, limit = 20, search, status }: { page: number; limit: number; search?: string; status?: string }) {
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { englishName: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.client.findMany({
        where, orderBy: { displayOrder: 'asc' },
        skip: (page - 1) * limit, take: limit,
        include: { clientServices: { include: { service: true } } },
      }),
      this.prisma.client.count({ where }),
    ]);
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const item = await this.prisma.client.findUnique({
      where: { id },
      include: { clientServices: { include: { service: true } }, projectClients: { include: { project: true } } },
    });
    if (!item) throw new NotFoundException('Client not found');
    return { ...item, serviceIds: item.clientServices.map(({ serviceId }) => serviceId) };
  }

  private mapDto(dto: any) {
    const data: any = {};
    const fieldMap: Record<string, string> = {
      name: 'name', englishName: 'englishName', slug: 'slug',
      descriptionEn: 'descriptionEn', descriptionFa: 'descriptionFa',
      website: 'website', locationEn: 'locationEn', locationFa: 'locationFa',
      featured: 'featured', displayOrder: 'displayOrder', status: 'status',
      seoTitleEn: 'seoTitleEn', seoTitleFa: 'seoTitleFa',
      seoDescEn: 'seoDescEn', seoDescFa: 'seoDescFa',
      logoId: 'logoId', coverImageId: 'coverImageId',
    };
    for (const [key, prismaKey] of Object.entries(fieldMap)) {
      const value = dto[key];
      if (value === undefined || value === '') continue;
      data[prismaKey] = value;
    }
    return data;
  }

  async create(dto: any) {
    const slug = dto.slug || slugify(dto.englishName || dto.name || '');
    const existing = slug ? await this.prisma.client.findUnique({ where: { slug } }) : null;
    if (existing) throw new ConflictException('Slug already exists');
    const { serviceIds, ...rest } = dto;
    const data = this.mapDto(rest);
    if (slug) data.slug = slug;
    const client = await this.prisma.client.create({ data });
    if (serviceIds?.length) {
      await this.prisma.clientService.createMany({
        data: serviceIds.map((serviceId: string) => ({ clientId: client.id, serviceId })),
      });
    }
    return this.findOne(client.id);
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    const { serviceIds, ...rest } = dto;
    const data = this.mapDto(rest);
    if (Object.keys(data).length > 0) {
      await this.prisma.client.update({ where: { id }, data });
    }
    if (serviceIds) {
      await this.prisma.clientService.deleteMany({ where: { clientId: id } });
      if (serviceIds.length) {
        await this.prisma.clientService.createMany({
          data: serviceIds.map((serviceId: string) => ({ clientId: id, serviceId })),
        });
      }
    }
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.client.delete({ where: { id } });
  }
}

// ─── Controller ─────────────────────────────
@ApiTags('Clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clients')
export class ClientsController {
  constructor(private service: ClientsService) {}

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
