'use client';

import { CollectionList } from '@/components/CollectionList';
import { clientsApi } from '@/lib/api';

export default function ClientsPage() {
  return (
    <CollectionList
      title="Clients"
      description="Manage your event production clients"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'company', label: 'Company' },
        {
          key: 'createdAt',
          label: 'Created',
          render: (item: any) => item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—',
        },
      ]}
      fetchFn={() => clientsApi.list()}
      createHref="/dashboard/clients/new"
      editHref={(item: any) => `/dashboard/clients/${item.id}/edit`}
      deleteFn={async (id: string) => { await clientsApi.delete(id); }}
    />
  );
}