'use client';

import { useAuthStore } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { LogOut, ChevronDown, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-surface-300 bg-surface-50 px-6">
      <div className="flex items-center gap-4">
        {/* Breadcrumb / Title area */}
        <h2 className="text-sm font-medium text-surface-700">
          Content Management
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* User dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-surface-200"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-200 text-surface-600">
              <User className="h-3.5 w-3.5" />
            </div>
            <span className="hidden text-sm font-medium text-surface-700 sm:block">
              {user?.name || 'User'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-surface-500" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-surface-300 bg-surface-100 py-1 shadow-xl animate-scale-in">
              <div className="border-b border-surface-300 px-4 py-3">
                <p className="text-sm font-medium text-surface-800">
                  {user?.name}
                </p>
                <p className="text-xs text-surface-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-surface-200 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}