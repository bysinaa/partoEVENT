'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth';
import { dashboardApi } from '@/lib/api';
import {
  FolderKanban,
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  Clock,
} from 'lucide-react';

interface DashboardStats {
  totalProjects: number;
  totalClients: number;
  totalServices: number;
  totalPosts: number;
  totalMedia: number;
  recentProjects: any[];
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const { data } = await dashboardApi.stats();
      setStats(data);
    } catch {
      // Use placeholder data if API not ready
      setStats({
        totalProjects: 0,
        totalClients: 0,
        totalServices: 0,
        totalPosts: 0,
        totalMedia: 0,
        recentProjects: [],
      });
    } finally {
      setIsLoading(false);
    }
  }

  const statCards = [
    {
      label: 'Projects',
      value: stats?.totalProjects ?? 0,
      icon: FolderKanban,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Clients',
      value: stats?.totalClients ?? 0,
      icon: Users,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Services',
      value: stats?.totalServices ?? 0,
      icon: Briefcase,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Blog Posts',
      value: stats?.totalPosts ?? 0,
      icon: FileText,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-semibold text-surface-900">
          Welcome back, {user?.name || 'Admin'}
        </h1>
        <p className="mt-1 text-sm text-surface-500">
          Manage your event production content
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="card group hover:border-surface-400 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">{card.label}</p>
                {isLoading ? (
                  <div className="skeleton mt-2 h-8 w-16" />
                ) : (
                  <p className="mt-1 text-3xl font-semibold text-surface-900">
                    {card.value}
                  </p>
                )}
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}
              >
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="mb-4 text-sm font-medium text-surface-700">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <a href="/dashboard/projects/new" className="btn-primary">
            <FolderKanban className="h-4 w-4" />
            New Project
          </a>
          <a href="/dashboard/posts/new" className="btn-secondary">
            <FileText className="h-4 w-4" />
            New Blog Post
          </a>
          <a href="/dashboard/media" className="btn-secondary">
            <TrendingUp className="h-4 w-4" />
            Upload Media
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-surface-500" />
          <h3 className="text-sm font-medium text-surface-700">
            Recent Activity
          </h3>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <div className="skeleton h-4 w-48" />
                  <div className="skeleton mt-1 h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-surface-500">
            No recent activity yet. Start creating content!
          </p>
        )}
      </div>
    </div>
  );
}