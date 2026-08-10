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

  private readonly include = {
    author: { select: { id: true, name: true, email: true } },
    projectClients: { include: { client: true } },
  } as const;

  private withClientIds<T extends { projectClients: { clientId: string }[] }>(project: T) {
    return { ...project, clientIds: project.projectClients.map(({ clientId }) => clientId) };
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async findAll(query: ProjectQueryDto) {
    const { page = 1, limit = 20, search, status, isFeatured } = query;

    const where: Prisma.ProjectWhereInput = {
      ...(status && { status }),
      ...(isFeatured !== undefined && { isFeatured }),
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
        include: this.include,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      items: items.map((project) => this.withClientIds(project)),
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
      include: this.include,
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return this.withClientIds(project);
  }

  async findBySlug(slug: string) {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      include: this.include,
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return this.withClientIds(project);
  }

  async create(dto: CreateProjectDto, authorId: string) {
    const slug = dto.slug || this.generateSlug(dto.titleEn || '');
    const existing = await this.prisma.project.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('A project with this slug already exists');
    }
    const { clientIds = [] } = dto;
    const data: Prisma.ProjectUncheckedCreateInput = {
      titleEn: dto.titleEn,
      titleFa: dto.titleFa,
      slug,
      descriptionEn: dto.descriptionEn,
      descriptionFa: dto.descriptionFa,
      locationEn: dto.locationEn,
      locationFa: dto.locationFa,
      year: dto.year,
      isFeatured: dto.isFeatured ?? false,
      status: dto.status ?? 'DRAFT',
      coverImageId: dto.coverImageId,
      thumbnailId: dto.thumbnailId,
      seoTitleEn: dto.seoTitleEn,
      seoTitleFa: dto.seoTitleFa,
      seoDescEn: dto.seoDescEn,
      seoDescFa: dto.seoDescFa,
      createdBy: authorId,
    };
    const project = await this.prisma.project.create({
      data: {
        ...data,
        projectClients: clientIds.length
          ? { createMany: { data: clientIds.map((clientId) => ({ clientId })) } }
          : undefined,
      },
      include: this.include,
    });
    return this.withClientIds(project);
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findOne(id);
    if (dto.slug) {
      const existing = await this.prisma.project.findFirst({
        where: { slug: dto.slug, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException('Slug already in use');
      }
    }
    const { slug, clientIds, ...fields } = dto;
    const data: Prisma.ProjectUncheckedUpdateInput = {
      ...fields,
      ...(slug ? { slug } : {}),
    };
    const project = await this.prisma.project.update({
      where: { id },
      data: {
        ...data,
        ...(clientIds !== undefined && {
          projectClients: {
            deleteMany: { clientId: { notIn: clientIds } },
            ...(clientIds.length && {
              createMany: {
                data: clientIds.map((clientId) => ({ clientId })),
                skipDuplicates: true,
              },
            }),
          },
        }),
      },
      include: this.include,
    });
    return this.withClientIds(project);
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
