import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData() {
    const [counts, recentProjects, recentPosts, recentActivity] = await Promise.all([
      this.getCounts(),
      this.getRecentProjects(),
      this.getRecentPosts(),
      this.getRecentActivity(),
    ]);

    return {
      counts,
      recentProjects,
      recentPosts,
      recentActivity,
    };
  }

  private async getCounts() {
    const [projects, clients, services, posts, media, teamMembers, categories] = await Promise.all([
      this.prisma.project.count(),
      this.prisma.client.count(),
      this.prisma.service.count(),
      this.prisma.post.count(),
      this.prisma.media.count(),
      this.prisma.teamMember.count(),
      this.prisma.category.count(),
    ]);

    return {
      projects,
      clients,
      services,
      posts,
      media,
      teamMembers,
      categories,
    };
  }

  private async getRecentProjects() {
    return this.prisma.project.findMany({
      take: 5,
      select: { id: true, titleEn: true, slug: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async getRecentPosts() {
    return this.prisma.post.findMany({
      take: 5,
      select: { id: true, titleEn: true, slug: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async getRecentActivity() {
    return this.prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
  }
}