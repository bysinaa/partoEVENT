import {
  Injectable, Controller, Get, Put, Param, Body,
  UseGuards, BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  validateSetting,
  groupForKey,
  SettingValidationError,
} from './settings.contract';

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

  /**
   * Settings are stored as strings. Booleans are normalized to 'true'/'false'
   * rather than JSON-stringified, so the public endpoint's JSON.parse yields a
   * real boolean and the frontend's show* flags behave predictably.
   */
  private serialize(value: any): string {
    if (typeof value === 'string') return value;
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return JSON.stringify(value);
  }

  async upsert(key: string, value: any, group?: string) {
    const error = validateSetting(key, value);
    if (error) {
      throw new BadRequestException({
        message: error.messageEn,
        messageFa: error.messageFa,
        errors: [error],
      });
    }

    return this.prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: this.serialize(value), group: group || groupForKey(key) },
      update: { value: this.serialize(value), ...(group && { group }) },
    });
  }

  /**
   * Save many settings at once.
   *
   * Validated as a batch first, then written in a transaction: the admin form
   * submits the whole panel, and a half-applied theme + typography change would
   * leave the site in a state the editor never chose.
   */
  async upsertMany(values: Record<string, any>) {
    if (!values || typeof values !== 'object' || Array.isArray(values)) {
      throw new BadRequestException({
        message: 'Expected an object of setting key/value pairs.',
        messageFa: 'ساختار داده تنظیمات نامعتبر است.',
      });
    }

    const errors: SettingValidationError[] = [];
    for (const [key, value] of Object.entries(values)) {
      const error = validateSetting(key, value);
      if (error) errors.push(error);
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: errors.map((e) => `${e.key}: ${e.messageEn}`).join(' '),
        messageFa: errors.map((e) => `${e.key}: ${e.messageFa}`).join(' '),
        errors,
      });
    }

    await this.prisma.$transaction(
      Object.entries(values).map(([key, value]) =>
        this.prisma.siteSetting.upsert({
          where: { key },
          create: { key, value: this.serialize(value), group: groupForKey(key) },
          update: { value: this.serialize(value) },
        }),
      ),
    );

    return { updated: Object.keys(values).length };
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

  /**
   * Declared before ':key' so the literal path is not swallowed by the
   * parameterized route.
   */
  @Put('bulk')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update multiple settings atomically' })
  upsertMany(@Body('values') values: Record<string, any>) {
    return this.service.upsertMany(values);
  }

  @Get(':key')
  findByKey(@Param('key') key: string) { return this.service.findByKey(key); }

  @Put(':key')
  @Roles('ADMIN', 'SUPER_ADMIN')
  upsert(@Param('key') key: string, @Body('value') value: any, @Body('group') group?: string) {
    return this.service.upsert(key, value, group);
  }
}
