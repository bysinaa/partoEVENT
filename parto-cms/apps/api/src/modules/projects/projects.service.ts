// ============================================
// Projects Service — Business Logic
// Simplified to match minimal schema
// ============================================

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto, ProjectQueryDto } from './dto/project.dto';
import { Prisma } from '../../../generated/prisma';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async findAll(query: ProjectQueryDto) {
    const { page = 1, limit = 20, search, status } = query;

    const where: Prisma.ProjectWhereInput = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { titleEn: { contains: search, mode: 'insensitive' } },
          { titleFa: { contains: search, mode: 'insensitive' } },
          { descriptionEn: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.project.count({ where }),
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
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async findBySlug(slug: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async create(dto: any, authorId: string) {
    const slug = dto.slug || this.generateSlug(dto.titleEn || '');
    const existing = await this.prisma.project.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('A project with this slug already exists');
    }
    const data: any = {
      titleEn: dto.titleEn,
      titleFa: dto.titleFa || '',
      slug,
      descriptionEn: dto.descriptionEn || dto.description || '',
      descriptionFa: dto.descriptionFa || '',
      clientNameEn: dto.clientName || dto.clientNameEn || '',
      clientNameFa: dto.clientNameFa || '',
      locationEn: dto.locationEn || '',
      locationFa: dto.locationFa || '',
      year: dto.year || null,
      isFeatured: dto.featured || dto.isFeatured || false,
      status: dto.status || 'DRAFT',
      coverImageId: dto.coverImage || dto.coverImageId || null,
      thumbnailId: dto.thumbnailId || dto.featuredImage || dto.featuredImageId || null,
      createdBy: authorId,
    };
    return this.prisma.project.create({
      data,
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    if (dto.slug) {
      const existing = await this.prisma.project.findFirst({
        where: { slug: dto.slug, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException('Slug already in use');
      }
    }
    const data: any = {};
    if (dto.titleEn !== undefined) data.titleEn = dto.titleEn;
    if (dto.titleFa !== undefined) data.titleFa = dto.titleFa;
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.descriptionEn !== undefined) data.descriptionEn = dto.descriptionEn;
    if (dto.descriptionFa !== undefined) data.descriptionFa = dto.descriptionFa;
    if (dto.contentEn !== undefined) data.contentEn = dto.contentEn;
    if (dto.contentFa !== undefined) data.contentFa = dto.contentFa;
    if (dto.clientName !== undefined) data.clientNameEn = dto.clientName;
    if (dto.clientNameEn !== undefined) data.clientNameEn = dto.clientNameEn;
    if (dto.clientNameFa !== undefined) data.clientNameFa = dto.clientNameFa;
    if (dto.locationEn !== undefined) data.locationEn = dto.locationEn;
    if (dto.locationFa !== undefined) data.locationFa = dto.locationFa;
    if (dto.year !== undefined) data.year = dto.year;
    if (dto.servicesUsed !== undefined) data.servicesUsed = dto.servicesUsed;
    if (dto.tags !== undefined) data.tags = dto.tags;
    if (dto.featured !== undefined) data.isFeatured = dto.featured;
    if (dto.isFeatured !== undefined) data.isFeatured = dto.isFeatured;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.featuredImage !== undefined) data.thumbnailId = dto.featuredImage || null;
    if (dto.featuredImageId !== undefined) data.thumbnailId = dto.featuredImageId || null;
    if (dto.coverImage !== undefined) data.coverImageId = dto.coverImage || null;
    if (dto.coverImageId !== undefined) data.coverImageId = dto.coverImageId || null;
    if (dto.thumbnailId !== undefined) data.thumbnailId = dto.thumbnailId || null;
    if (dto.description !== undefined) data.descriptionEn = dto.description;
    return this.prisma.project.update({
      where: { id },
      data,
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.project.delete({ where: { id } });
  }

  async getStats() {
    const [totalProjects, publishedProjects, featuredProjects, draftProjects] = await Promise.all([
      this.prisma.project.count(),
      this.prisma.project.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.project.count({ where: { isFeatured: true } }),
      this.prisma.project.count({ where: { status: 'DRAFT' } }),
    ]);

    return { totalProjects, publishedProjects, featuredProjects, draftProjects };
  }
}