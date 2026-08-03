'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';

interface CollectionItem {
  id: string;
  [key: string]: any;
}

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface CollectionListProps {
  title: string;
  description?: string;
  columns: Column<CollectionItem>[];
  fetchFn: () => Promise<{ data: any }>;
  createHref?: string;
  editHref?: (item: CollectionItem) => string;
  deleteFn?: (id: string) => Promise<any>;
}

export function CollectionList({
  title,
  description,
  columns,
  fetchFn,
  createHref,
  editHref,
  deleteFn,
}: CollectionListProps) {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetchFn();
      setItems(Array.isArray(res.data) ? res.data : res.data?.items || []);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!deleteFn) return;
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteFn(id);
      setItems(items.filter((item) => item.id !== id));
    } catch {
      alert('Failed to delete');
    }
  };

  const filtered = items.filter((item) =>
    columns.some((col) => {
      const val = item[col.key];
      return val && String(val).toLowerCase().includes(search.toLowerCase());
    }),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-surface-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-surface-500">{description}</p>
          )}
        </div>
        {createHref && (
          <Link href={createHref} className="btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            Create {title.slice(0, -1)}
          </Link>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500" />
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <span className="text-sm text-surface-500">
          {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-surface-300 bg-white overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-surface-300 border-t-brand-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-surface-500">No items found</p>
            {createHref && (
              <Link href={createHref} className="mt-3 text-sm text-brand-500 hover:underline">
                Create your first {title.slice(0, -1).toLowerCase()}
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-300 bg-surface-50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-surface-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-surface-50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-surface-700">
                      {col.render ? col.render(item) : item[col.key] ?? '—'}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)}
                        className="rounded-lg p-1.5 text-surface-500 hover:bg-surface-200 transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {openMenu === item.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-surface-300 bg-white py-1 shadow-lg">
                          {editHref && (
                            <Link
                              href={editHref(item)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-surface-700 hover:bg-surface-100"
                              onClick={() => setOpenMenu(null)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Link>
                          )}
                          {deleteFn && (
                            <button
                              onClick={() => {
                                setOpenMenu(null);
                                handleDelete(item.id);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}