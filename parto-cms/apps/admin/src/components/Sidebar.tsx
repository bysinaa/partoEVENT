'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Briefcase,
  UserCog,
  Image,
  FileText,
  Newspaper,
  Settings,
  Globe,
  Menu,
  X,
  Palette,
  MonitorPlay,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Projects',
    href: '/dashboard/projects',
    icon: FolderKanban,
  },
  {
    label: 'Services',
    href: '/dashboard/services',
    icon: Briefcase,
  },
  {
    label: 'Clients',
    href: '/dashboard/clients',
    icon: Users,
  },
  {
    label: 'Team',
    href: '/dashboard/team',
    icon: UserCog,
  },
  {
    label: 'Media Library',
    href: '/dashboard/media',
    icon: Image,
  },
  {
    label: 'Pages',
    href: '/dashboard/pages',
    icon: FileText,
  },
  {
    label: 'Blog',
    href: '/dashboard/posts',
    icon: Newspaper,
  },
];

const secondaryNav: NavItem[] = [
  {
    label: 'Menus',
    href: '/dashboard/menus',
    icon: Menu,
  },
  {
    label: 'Categories',
    href: '/dashboard/categories',
    icon: Palette,
  },
  {
    label: 'Translations',
    href: '/dashboard/translations',
    icon: Globe,
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg p-2 bg-surface-100 border border-surface-300 lg:hidden"
      >
        {isOpen ? (
          <X className="h-5 w-5 text-surface-700" />
        ) : (
          <Menu className="h-5 w-5 text-surface-700" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed left-0 top-0 z-40 h-screen w-64 border-r border-surface-300 bg-surface-50 transition-transform duration-200',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-surface-300 px-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <MonitorPlay className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold text-surface-900">
                Parto CMS
              </span>
            </div>
          </div>

          {/* Primary navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-surface-500">
              Content
            </p>
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-brand-600/10 text-brand-500'
                    : 'text-surface-600 hover:bg-surface-200 hover:text-surface-800',
                )}
              >
                <item.icon
                  className={clsx(
                    'h-4 w-4 flex-shrink-0',
                    isActive(item.href)
                      ? 'text-brand-500'
                      : 'text-surface-500',
                  )}
                />
                {item.label}
                {item.badge && (
                  <span className="badge-info ml-auto text-[10px]">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}

            <div className="my-4 border-t border-surface-300" />

            <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-surface-500">
              System
            </p>
            {secondaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-brand-600/10 text-brand-500'
                    : 'text-surface-600 hover:bg-surface-200 hover:text-surface-800',
                )}
              >
                <item.icon
                  className={clsx(
                    'h-4 w-4 flex-shrink-0',
                    isActive(item.href)
                      ? 'text-brand-500'
                      : 'text-surface-500',
                  )}
                />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Version */}
          <div className="border-t border-surface-300 px-5 py-3">
            <p className="text-[11px] text-surface-500">
              v0.1.0 · Parto Event Group
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}