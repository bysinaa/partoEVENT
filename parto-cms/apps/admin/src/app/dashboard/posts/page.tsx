'use client';

import { CollectionList } from '@/components/CollectionList';
import { postsApi } from '@/lib/api';

export default function PostsPage() {
  return (
    <CollectionList
      title="Blog Posts"
      description="Manage your blog content"
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
      fetchFn={() => postsApi.list()}
      createHref="/dashboard/posts/new"
      editHref={(item: any) => `/dashboard/posts/${item.id}/edit`}
      deleteFn={(id: string) => postsApi.delete(id).then(() => void 0)}
    />
  );
}