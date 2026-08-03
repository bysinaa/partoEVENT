// ============================================
// Public API Controller - No Auth Required
// ============================================

import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

function withMediaUrl<T extends { filename: string }>(media: T | null) {
  if (!media) return null;
  return {
    ...media,
    url: `/uploads/${media.filename}`,
  };
}

@ApiTags('Public API')
@Controller('api/public')
export class PublicController {
  constructor(private prisma: PrismaService) {}

  // ─── Clients ────────────────────────────────
  
  @Get('clients')
  @ApiOperation({ summary: 'List all published clients' })
  async getClients(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('featured') featured?: string,
  ) {
    const where: any = { status: 'PUBLISHED' };
    if (featured === 'true') where.featured = true;
    
    const [items, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        orderBy: { displayOrder: 'asc' },
        skip: ((+(page || '1')) - 1) * +(limit || '20'),
        take: +(limit || '20'),
        include: { clientServices: { include: { service: true } } },
      }),
      this.prisma.client.count({ where }),
    ]);
    
    return { items, meta: { total, page: +(page || '1'), limit: +(limit || '20'), totalPages: Math.ceil(total / +(limit || '20')) } };
  }

  @Get('clients/:slug')
  @ApiOperation({ summary: 'Get client by slug' })
  async getClientBySlug(@Param('slug') slug: string) {
    const client = await this.prisma.client.findUnique({
      where: { slug, status: 'PUBLISHED' },
      include: { 
        clientServices: { include: { service: true } },
        projectClients: { include: { project: true } },
      },
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }

  // ─── Services ────────────────────────────────
  
  @Get('services')
  @ApiOperation({ summary: 'List all published services' })
  async getServices(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const [items, total] = await Promise.all([
      this.prisma.service.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { order: 'asc' },
        skip: ((+(page || '1')) - 1) * +(limit || '20'),
        take: +(limit || '20'),
      }),
      this.prisma.service.count({ where: { status: 'PUBLISHED' } }),
    ]);
    
    return { items, meta: { total, page: +(page || '1'), limit: +(limit || '20'), totalPages: Math.ceil(total / +(limit || '20')) } };
  }

  @Get('services/:slug')
  @ApiOperation({ summary: 'Get service by slug' })
  async getServiceBySlug(@Param('slug') slug: string) {
    const service = await this.prisma.service.findUnique({
      where: { slug, status: 'PUBLISHED' },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  // ─── Projects ────────────────────────────────
  
  @Get('projects')
  @ApiOperation({ summary: 'List all published projects' })
  async getProjects(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('featured') featured?: string,
    @Query('clientId') clientId?: string,
  ) {
    const where: any = { status: 'PUBLISHED' };
    if (featured === 'true') where.isFeatured = true;
    if (clientId) {
      where.projectClients = { some: { clientId } };
    }
    
    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: ((+(page || '1')) - 1) * +(limit || '20'),
        take: +(limit || '20'),
        include: { projectClients: { include: { client: true } } },
      }),
      this.prisma.project.count({ where }),
    ]);
    
    return { items, meta: { total, page: +(page || '1'), limit: +(limit || '20'), totalPages: Math.ceil(total / +(limit || '20')) } };
  }

  @Get('projects/:slug')
  @ApiOperation({ summary: 'Get project by slug' })
  async getProjectBySlug(@Param('slug') slug: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug, status: 'PUBLISHED' },
      include: { projectClients: { include: { client: true } } },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  // ─── Team Members ─────────────────────────────
  
  @Get('team')
  @ApiOperation({ summary: 'List all active team members' })
  async getTeamMembers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const [items, total] = await Promise.all([
      this.prisma.teamMember.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        skip: ((+(page || '1')) - 1) * +(limit || '20'),
        take: +(limit || '20'),
        include: { photo: true },
      }),
      this.prisma.teamMember.count({ where: { isActive: true } }),
    ]);
    
    return {
      items: items.map((item) => ({
        ...item,
        photo: withMediaUrl(item.photo),
      })),
      meta: { total, page: +(page || '1'), limit: +(limit || '20'), totalPages: Math.ceil(total / +(limit || '20')) },
    };
  }

  // ─── Posts ────────────────────────────────
  
  @Get('posts')
  @ApiOperation({ summary: 'List all published posts' })
  async getPosts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    const where: any = { status: 'PUBLISHED' };
    if (categoryId) where.categoryId = categoryId;
    
    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: ((+(page || '1')) - 1) * +(limit || '20'),
        take: +(limit || '20'),
        include: { category: true },
      }),
      this.prisma.post.count({ where }),
    ]);
    
    return { items, meta: { total, page: +(page || '1'), limit: +(limit || '20'), totalPages: Math.ceil(total / +(limit || '20')) } };
  }

  @Get('posts/:slug')
  @ApiOperation({ summary: 'Get post by slug' })
  async getPostBySlug(@Param('slug') slug: string) {
    const post = await this.prisma.post.findUnique({
      where: { slug, status: 'PUBLISHED' },
      include: { category: true },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  // ─── Categories ──────────────────────────────
  
  @Get('categories')
  @ApiOperation({ summary: 'List all categories' })
  async getCategories(@Query('type') type?: string) {
    const where: any = { status: 'PUBLISHED' };
    if (type) where.type = type;
    
    return this.prisma.category.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  // ─── Pages ────────────────────────────────
  
  @Get('pages/:slug')
  @ApiOperation({ summary: 'Get page by slug' })
  async getPageBySlug(@Param('slug') slug: string) {
    const page = await this.prisma.page.findUnique({
      where: { slug, status: 'PUBLISHED' },
    });
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    return page;
  }

  // ─── Settings ────────────────────────────────
  
  @Get('settings')
  @ApiOperation({ summary: 'Get all site settings' })
  async getSettings() {
    const settings = await this.prisma.siteSetting.findMany();
    const result: Record<string, any> = {};
    for (const setting of settings) {
      try {
        result[setting.key] = JSON.parse(setting.value);
      } catch {
        result[setting.key] = setting.value;
      }
    }
    return result;
  }

  @Get('settings/:key')
  @ApiOperation({ summary: 'Get setting by key' })
  async getSettingByKey(@Param('key') key: string) {
    const setting = await this.prisma.siteSetting.findUnique({
      where: { key },
    });
    if (!setting) {
      return null;
    }
    try {
      return JSON.parse(setting.value);
    } catch {
      return setting.value;
    }
  }

  // ─── Media ────────────────────────────────
  
  @Get('media/:id')
  @ApiOperation({ summary: 'Get media by ID' })
  async getMediaById(@Param('id') id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    return withMediaUrl(media);
  }

  // ─── Stats ────────────────────────────────
  
  @Get('stats')
  @ApiOperation({ summary: 'Get site statistics' })
  async getStats() {
    const [clients, projects, teamMembers, posts] = await Promise.all([
      this.prisma.client.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.project.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.teamMember.count({ where: { isActive: true } }),
      this.prisma.post.count({ where: { status: 'PUBLISHED' } }),
    ]);
    
    return { clients, projects, teamMembers, posts };
  }
}