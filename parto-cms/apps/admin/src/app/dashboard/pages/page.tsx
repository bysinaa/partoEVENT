'use client';

import { CollectionList } from '@/components/CollectionList';
import { pagesApi } from '@/lib/api';

export default function PagesPage() {
  return (
    <CollectionList
      title="Pages"
      description="Manage your website pages"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'slug', label: 'Slug' },
        {
          key: 'status',
          label: 'Status',
          render: (item: any) => (
            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${item.status === 'PUBLISHED' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
              {item.status || 'DRAFT'}
            </span>
          ),
        },
        {
          key: 'createdAt',
          label: 'Created',
          render: (item: any) => item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—',
        },
      ]}
      fetchFn={() => pagesApi.list()}
      createHref="/dashboard/pages/new"
      editHref={(item: any) => `/dashboard/pages/${item.id}/edit`}
      deleteFn={async (id: string) => { await pagesApi.delete(id); }}
    />
  );
}