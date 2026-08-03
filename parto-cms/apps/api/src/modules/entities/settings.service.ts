import {
  Injectable, Controller, Get, Put, Param, Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

// ─── Service ────────────────────────────────
@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.siteSetting.findMany({ orderBy: { key: 'asc' } });
  }

  async findByKey(key: string) {
    return this.prisma.siteSetting.findUnique({ where: { key } });
  }

  async upsert(key: string, value: any, group?: string) {
    const strValue = typeof value === 'string' ? value : JSON.stringify(value);
    return this.prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: strValue, group: group || 'general' },
      update: { value: strValue, ...(group && { group }) },
    });
  }
}

// ─── Controller ─────────────────────────────
@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private service: SettingsService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':key')
  findByKey(@Param('key') key: string) { return this.service.findByKey(key); }

  @Put(':key')
  @Roles('ADMIN', 'SUPER_ADMIN')
  upsert(@Param('key') key: string, @Body('value') value: any, @Body('group') group?: string) {
    return this.service.upsert(key, value, group);
  }
}