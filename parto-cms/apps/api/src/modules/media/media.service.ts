// ============================================
// Media Service — Business Logic
// Simplified to match minimal schema
// ============================================

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MediaType, Prisma } from '../../../generated/prisma';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { mediaUrl } from './media.response';

export const SUPPORTED_UPLOADS: Readonly<Record<string, readonly string[]>> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'image/svg+xml': ['.svg'],
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
};

export function validateUploadType(file: { mimetype?: string; originalname?: string }): void {
  const mimeType = file.mimetype?.toLowerCase() || '';
  const extension = path.extname(file.originalname || '').toLowerCase();
  if (!SUPPORTED_UPLOADS[mimeType]?.includes(extension)) {
    throw new BadRequestException(
      'Unsupported file type. Allowed: JPG, PNG, WebP, GIF, SVG, MP4, and WebM.',
    );
  }
}

export function safeUploadPath(uploadDir: string, filename: string): string {
  if (!filename || path.basename(filename) !== filename) {
    throw new BadRequestException('Invalid media filename');
  }
  const root = path.resolve(uploadDir);
  const filePath = path.resolve(root, filename);
  if (!filePath.startsWith(`${root}${path.sep}`)) {
    throw new BadRequestException('Invalid media filename');
  }
  return filePath;
}

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
    const fileUrl = mediaUrl(media.filename);

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
    const filePath = safeUploadPath(this.uploadDir, media.filename);
    const deleted = await this.prisma.media.delete({ where: { id } });
    try {
      await fs.promises.unlink(filePath);
    } catch (error: any) {
      if (error?.code !== 'ENOENT') throw error;
    }
    return deleted;
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
    try {
      validateUploadType(file);
    } catch (error) {
      if (file.filename) {
        await fs.promises.unlink(safeUploadPath(this.uploadDir, file.filename)).catch((unlinkError: any) => {
          if (unlinkError?.code !== 'ENOENT') throw unlinkError;
        });
      }
      throw error;
    }

    let width: number | null = null;
    let height: number | null = null;
    if (file.mimetype.startsWith('image/')) {
      try {
        const metadata = await sharp(file.path).metadata();
        width = metadata.width ?? null;
        height = metadata.height ?? null;
      } catch {
        await fs.promises.unlink(safeUploadPath(this.uploadDir, file.filename)).catch((unlinkError: any) => {
          if (unlinkError?.code !== 'ENOENT') throw unlinkError;
        });
        throw new BadRequestException('Invalid image file');
      }
    }
    try {
      const media = await this.prisma.media.create({
        data: {
          originalName: file.originalname,
          filename: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          type: this.getMediaType(file.mimetype),
          width,
          height,
        },
      });
      return this.toMediaResponse(media);
    } catch (error) {
      await fs.promises.unlink(safeUploadPath(this.uploadDir, file.filename)).catch((unlinkError: any) => {
        if (unlinkError?.code !== 'ENOENT') throw unlinkError;
      });
      throw error;
    }
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
