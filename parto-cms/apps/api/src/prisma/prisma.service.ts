// ============================================
// Prisma Service — Database Connection Manager
// Lifecycle-aware, injectable Prisma client
// ============================================

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Clean all tables (for testing)
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    const modelNames = Reflect.ownKeys(this).filter(
      (key) => typeof key === 'string' && key[0] !== '_',
    );

    for (const modelName of modelNames) {
      const model = (this as any)[modelName];
      if (model && typeof model?.deleteMany === 'function') {
        await model.deleteMany();
      }
    }
  }
}