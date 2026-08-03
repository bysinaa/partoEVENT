'use client';

import { CollectionList } from '@/components/CollectionList';
import { teamApi } from '@/lib/api';

export default function TeamPage() {
  return (
    <CollectionList
      title="Team"
      description="Manage team members"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
        { key: 'position', label: 'Position' },
        {
          key: 'createdAt',
          label: 'Created',
          render: (item: any) => item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—',
        },
      ]}
      fetchFn={() => teamApi.list()}
      createHref="/dashboard/team/new"
      editHref={(item: any) => `/dashboard/team/${item.id}/edit`}
      deleteFn={(id: string) => teamApi.delete(id)}
    />
  );
}