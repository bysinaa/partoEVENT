'use client';

import { CollectionList } from '@/components/CollectionList';
import { projectsApi } from '@/lib/api';

export default function ProjectsPage() {
  return (
    <CollectionList
      title="Projects"
      description="Manage your event production projects"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'slug', label: 'Slug' },
        {
          key: 'status',
          label: 'Status',
          render: (item) => (
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                item.status === 'PUBLISHED'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {item.status || 'DRAFT'}
            </span>
          ),
        },
        {
          key: 'createdAt',
          label: 'Created',
          render: (item) =>
            item.createdAt
              ? new Date(item.createdAt).toLocaleDateString()
              : '—',
        },
      ]}
      fetchFn={() => projectsApi.list()}
      createHref="/dashboard/projects/new"
      editHref={(item) => `/dashboard/projects/${item.id}/edit`}
      deleteFn={async (id) => { await projectsApi.delete(id); }}
    />
  );
}