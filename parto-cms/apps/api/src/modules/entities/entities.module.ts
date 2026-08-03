import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ClientsController, ClientsService } from './clients.service';
import { ServicesController, ServicesService } from './services.service';
import { TeamController, TeamService } from './team.service';
import { CategoriesController, CategoriesService } from './categories.service';
import { PagesController, PagesService } from './pages.service';
import { PostsController, PostsService } from './posts.service';
import { SettingsController, SettingsService } from './settings.service';
import { ActivityController, ActivityService } from './activity.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    ClientsController,
    ServicesController,
    TeamController,
    CategoriesController,
    PagesController,
    PostsController,
    SettingsController,
    ActivityController,
  ],
  providers: [
    ClientsService,
    ServicesService,
    TeamService,
    CategoriesService,
    PagesService,
    PostsService,
    SettingsService,
    ActivityService,
  ],
})
export class EntitiesModule {}