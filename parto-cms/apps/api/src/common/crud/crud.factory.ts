// ============================================
// CRUD Factory — Generates Controller + Service for any Prisma model
// Eliminates repetitive code for standard CRUD operations
// ============================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { PaginationQueryDto, PaginatedResult } from '../dto/pagination.dto';
import { ContentStatus } from '../../../generated/prisma';

// ─── DTOs ───────────────────────────────────

export class CreateBilingualDto {
  slug?: string;
  titleEn!: string;
  titleFa?: string;
  descriptionEn?: string;
  descriptionFa?: string;
  status?: ContentStatus;
  [key: string]: any;
}

export class UpdateBilingualDto {
  slug?: string;
  titleEn?: string;
  titleFa?: string;
  descriptionEn?: string;
  descriptionFa?: string;
  status?: ContentStatus;
  [key: string]: any;
}

// ─── Configuration ──────────────────────────

export interface CrudConfig {
  /** Prisma model name (lowercase) e.g. 'client' */
  modelName: string;
  /** URL path e.g. 'clients' */
  path: string;
  /** Swagger tag name */
  tag: string;
  /** Fields to search on */
  searchFields?: string[];
  /** Fields to select (optional, defaults to all) */
  selectFields?: Record<string, boolean>;
  /** Include relations */
  includeRelations?: Record<string, boolean>;
  /** Additional create fields from body */
  extraCreateFields?: string[];
  /** Fields valid for ordering */
  orderFields?: string[];
  /** Slug generation field (e.g. 'titleEn') */
  slugField?: string;
  /** Title field for display (e.g. 'titleEn') */
  titleField?: string;
}

// ─── Slug Generator ─────────────────────────

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─── Factory Functions ──────────────────────

export function createCrudService(config: CrudConfig) {
  class GenericCrudService {
    constructor(public readonly prisma: PrismaService) {}

    async findAll(query: PaginationQueryDto): Promise<PaginatedResult<any>> {
      const { page = 1, limit = 20, search, status, orderBy, order = 'desc' } = query;
      const model = (this.prisma as any)[config.modelName];

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (search && config.searchFields?.length) {
        where.OR = config.searchFields.map((field) => ({
          [field]: { contains: search, mode: 'insensitive' },
        }));
      }

      const orderByClause: any = {};
      if (orderBy && config.orderFields?.includes(orderBy)) {
        orderByClause[orderBy] = order;
      } else {
        // Default ordering: use displayOrder, order, or createdAt
        if (config.orderFields?.includes('displayOrder')) {
          orderByClause.displayOrder = 'asc';
        } else if (config.orderFields?.includes('order')) {
          orderByClause.order = 'asc';
        } else {
          orderByClause.createdAt = 'desc';
        }
      }

      const [items, total] = await Promise.all([
        model.findMany({
          where,
          orderBy: orderByClause,
          skip: (page - 1) * limit,
          take: limit,
          ...(config.includeRelations && { include: config.includeRelations }),
        }),
        model.count({ where }),
      ]);

      return {
        items,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    async findOne(id: string) {
      const model = (this.prisma as any)[config.modelName];
      const item = await model.findUnique({
        where: { id },
        ...(config.includeRelations && { include: config.includeRelations }),
      });
      if (!item) {
        throw new Error(`${config.tag} not found`);
      }
      return item;
    }

    async findBySlug(slug: string) {
      const model = (this.prisma as any)[config.modelName];
      const item = await model.findUnique({
        where: { slug },
        ...(config.includeRelations && { include: config.includeRelations }),
      });
      if (!item) {
        throw new Error(`${config.tag} not found`);
      }
      return item;
    }

    async create(dto: CreateBilingualDto) {
      const model = (this.prisma as any)[config.modelName];

      // Auto-generate slug if not provided
      const slug = dto.slug || generateSlug(dto[config.slugField || 'titleEn'] || '');

      // Check slug uniqueness
      if (slug) {
        const existing = await model.findUnique({ where: { slug } });
        if (existing) {
          throw new Error(`Slug "${slug}" already exists`);
        }
      }

      // Build create data from DTO
      const data: any = {};
      for (const key of Object.keys(dto)) {
        // Skip undefined, null and empty-string values so we don't send invalid enum values (e.g. "")
        if (dto[key] !== undefined && dto[key] !== null && dto[key] !== '') {
          data[key] = dto[key];
        }
      }
      if (slug) data.slug = slug;
      if (dto.status) data.status = dto.status;

      return model.create({
        data,
        ...(config.includeRelations && { include: config.includeRelations }),
      });
    }

    async update(id: string, dto: UpdateBilingualDto) {
      const model = (this.prisma as any)[config.modelName];
      await this.findOne(id);

      // Check slug uniqueness if slug is being changed
      if (dto.slug) {
        const existing = await model.findFirst({
          where: { slug: dto.slug, id: { not: id } },
        });
        if (existing) {
          throw new Error(`Slug "${dto.slug}" already in use`);
        }
      }

      const data: any = {};
      for (const key of Object.keys(dto)) {
        // Avoid writing empty strings (which cause Prisma enum validation errors)
        if (dto[key] !== undefined && dto[key] !== '') {
          data[key] = dto[key];
        }
      }

      return model.update({
        where: { id },
        data,
        ...(config.includeRelations && { include: config.includeRelations }),
      });
    }

    async remove(id: string) {
      const model = (this.prisma as any)[config.modelName];
      await this.findOne(id);
      return model.delete({ where: { id } });
    }

    async reorder(items: { id: string; order: number }[]) {
      const model = (this.prisma as any)[config.modelName];
      const orderField = config.orderFields?.includes('displayOrder') ? 'displayOrder' : 'order';

      await this.prisma.$transaction(
        items.map((item) =>
          model.update({
            where: { id: item.id },
            data: { [orderField]: item.order },
          }),
        ),
      );

      return { success: true };
    }
  }

  return GenericCrudService;
}

export function createCrudController(config: CrudConfig) {
  const ServiceClass = createCrudService(config);

  @ApiTags(config.tag)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Controller(config.path)
  class GenericCrudController {
    constructor(public readonly service: InstanceType<typeof ServiceClass>) {}

    @Get()
    @ApiOperation({ summary: `List all ${config.tag}` })
    findAll(@Query() query: PaginationQueryDto) {
      return this.service.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: `Get ${config.tag} by ID` })
    findOne(@Param('id') id: string) {
      return this.service.findOne(id);
    }

    @Post()
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: `Create ${config.tag}` })
    create(@Body() dto: CreateBilingualDto) {
      return this.service.create(dto);
    }

    @Patch(':id')
    @Roles('ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: `Update ${config.tag}` })
    update(@Param('id') id: string, @Body() dto: UpdateBilingualDto) {
      return this.service.update(id, dto);
    }

    @Delete(':id')
    @Roles('SUPER_ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: `Delete ${config.tag}` })
    remove(@Param('id') id: string) {
      return this.service.remove(id);
    }
  }

  return GenericCrudController;
}