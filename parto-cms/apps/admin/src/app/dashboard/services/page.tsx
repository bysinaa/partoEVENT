'use client';

import { CollectionList } from '@/components/CollectionList';
import { servicesApi } from '@/lib/api';

export default function ServicesPage() {
  return (
    <CollectionList
      title="Services"
      description="Manage your event production services"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'slug', label: 'Slug' },
        { key: 'description', label: 'Description', render: (item: any) => <span className="line-clamp-1 max-w-[300px]">{item.description || '—'}</span> },
        {
          key: 'createdAt',
          label: 'Created',
          render: (item: any) => item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—',
        },
      ]}
      fetchFn={() => servicesApi.list()}
      createHref="/dashboard/services/new"
      editHref={(item: any) => `/dashboard/services/${item.id}/edit`}
      deleteFn={async (id: string) => { await servicesApi.delete(id); }}
    />
  );
}