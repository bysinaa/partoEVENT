// ============================================
// Media Service — Business Logic
// Simplified to match minimal schema
// ============================================

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MediaType, Prisma } from '../../../generated/prisma';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MediaService {
  private uploadDir = path.join(process.cwd(), 'uploads');

  constructor(private prisma: PrismaService) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private getMediaType(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) return 'IMAGE';
    if (mimeType.startsWith('video/')) return 'VIDEO';
    return 'DOCUMENT';
  }

  private toMediaResponse<T extends { id: string; filename: string }>(media: T) {
    const apiUrl = (process.env.API_URL || `http://localhost:${process.env.API_PORT || '3006'}`).replace(/\/$/, '');
    const fileUrl = `${apiUrl}/uploads/${media.filename}`;

    return {
      ...media,
      url: fileUrl,
      downloadUrl: fileUrl,
      path: `/uploads/${media.filename}`,
    };
  }

  async findAll(query: { page?: number; limit?: number; type?: string; search?: string }) {
    const { page = 1, limit = 20, type, search } = query;

    const where: Prisma.MediaWhereInput = {
      ...(type && { type: type as MediaType }),
      ...(search && {
        OR: [
          { originalName: { contains: search, mode: 'insensitive' } },
          { altText: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.media.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toMediaResponse(item)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    return this.toMediaResponse(media);
  }

  async delete(id: string) {
    const media = await this.findOne(id);
    return this.prisma.media.delete({ where: { id } });
  }

  async update(id: string, data: { altText?: string }) {
    await this.findOne(id);
    return this.prisma.media.update({
      where: { id },
      data: {
        ...(data.altText !== undefined && { altText: data.altText }),
      },
    });
  }

  async upload(file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const media = await this.prisma.media.create({
      data: {
        originalName: file.originalname,
        filename: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        type: this.getMediaType(file.mimetype),
      },
    });
    return this.toMediaResponse(media);
  }

  async getStats() {
    const [totalMedia, images, videos, documents] = await Promise.all([
      this.prisma.media.count(),
      this.prisma.media.count({ where: { type: 'IMAGE' } }),
      this.prisma.media.count({ where: { type: 'VIDEO' } }),
      this.prisma.media.count({ where: { type: 'DOCUMENT' } }),
    ]);

    return { totalMedia, images, videos, documents };
  }
}