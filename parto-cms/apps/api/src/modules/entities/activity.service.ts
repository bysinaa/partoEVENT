import { Injectable, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

// ─── Service ────────────────────────────────
@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async findAll({ limit = 50, entityType }: { limit: number; entityType?: string }) {
    const where: any = {};
    if (entityType) where.entityType = entityType;
    return this.prisma.activityLog.findMany({
      where, orderBy: { createdAt: 'desc' }, take: limit,
    });
  }
}

// ─── Controller ─────────────────────────────
@ApiTags('Activity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('activity')
export class ActivityController {
  constructor(private service: ActivityService) {}

  @Get()
  findAll(@Query('limit') limit?: string, @Query('entityType') entityType?: string) {
    return this.service.findAll({ limit: +(limit || '50'), entityType });
  }
}