import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { EntitiesModule } from '../entities/entities.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, EntitiesModule],
  controllers: [PublicController],
})
export class PublicModule {}