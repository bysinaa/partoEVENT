// ============================================
// Posts Service — Business Logic
// ============================================

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '../../../generated/prisma';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async findAll(query: { page?: number; limit?: number; search?: string; status?: string }) {
    const { page = 1, limit = 20, search, status } = query;

    const where: Prisma.PostWhereInput = {
      ...(status && { status: status as any }),
      ...(search && {
        OR: [
          { titleEn: { contains: search, mode: 'insensitive' } },
          { titleFa: { contains: search, mode: 'insensitive' } },
          { contentEn: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: {
          category: { select: { id: true, nameEn: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.post.count({ where }),
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
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, nameEn: true, slug: true } },
      },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, nameEn: true, slug: true } },
      },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async create(dto: any, authorId?: string) {
    const slug = dto.slug || this.generateSlug(dto.titleEn || '');
    if (slug) {
      const existing = await this.prisma.post.findUnique({ where: { slug } });
      if (existing) {
        throw new ConflictException('A post with this slug already exists');
      }
    }
    const data: any = {
      titleEn: dto.titleEn,
      titleFa: dto.titleFa || '',
      slug,
      contentEn: dto.contentEn || '',
      contentFa: dto.contentFa || '',
      excerptEn: dto.excerptEn || '',
      excerptFa: dto.excerptFa || '',
      coverImageId: dto.coverImage || dto.coverImageId || null,
      categoryId: dto.categoryId || null,
      authorId: authorId || dto.authorId || null,
      status: dto.status || 'DRAFT',
      publishedAt: dto.publishedAt || null,
      seoTitleEn: dto.seoTitleEn || null,
      seoTitleFa: dto.seoTitleFa || null,
      seoDescEn: dto.seoDescEn || null,
      seoDescFa: dto.seoDescFa || null,
      tags: dto.tags || null,
    };
    return this.prisma.post.create({
      data,
      include: { category: { select: { id: true, nameEn: true, slug: true } } },
    });
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    if (dto.slug) {
      const existing = await this.prisma.post.findFirst({
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
    if (dto.contentEn !== undefined) data.contentEn = dto.contentEn;
    if (dto.contentFa !== undefined) data.contentFa = dto.contentFa;
    if (dto.excerptEn !== undefined) data.excerptEn = dto.excerptEn;
    if (dto.excerptFa !== undefined) data.excerptFa = dto.excerptFa;
    if (dto.coverImage !== undefined) data.coverImageId = dto.coverImage || null;
    if (dto.coverImageId !== undefined) data.coverImageId = dto.coverImageId || null;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId || null;
    if (dto.authorId !== undefined) data.authorId = dto.authorId || null;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.publishedAt !== undefined) data.publishedAt = dto.publishedAt || null;
    if (dto.seoTitleEn !== undefined) data.seoTitleEn = dto.seoTitleEn || null;
    if (dto.seoTitleFa !== undefined) data.seoTitleFa = dto.seoTitleFa || null;
    if (dto.seoDescEn !== undefined) data.seoDescEn = dto.seoDescEn || null;
    if (dto.seoDescFa !== undefined) data.seoDescFa = dto.seoDescFa || null;
    if (dto.tags !== undefined) data.tags = dto.tags || null;
    return this.prisma.post.update({
      where: { id },
      data,
      include: { category: { select: { id: true, nameEn: true, slug: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.post.delete({ where: { id } });
  }

  async getStats() {
    const [totalPosts, publishedPosts, draftPosts, archivedPosts] = await Promise.all([
      this.prisma.post.count(),
      this.prisma.post.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.post.count({ where: { status: 'DRAFT' } }),
      this.prisma.post.count({ where: { status: 'ARCHIVED' } }),
    ]);

    return { totalPosts, publishedPosts, draftPosts, archivedPosts };
  }
}