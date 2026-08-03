import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { MediaModule } from './modules/media/media.module';
import { EntitiesModule } from './modules/entities/entities.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PublicModule } from './modules/public/public.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    AuthModule,
    ProjectsModule,
    MediaModule,
    EntitiesModule,
    DashboardModule,
    PublicModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}