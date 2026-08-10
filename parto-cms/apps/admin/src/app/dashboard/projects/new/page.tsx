'use client';

import EntityForm from '@/components/EntityForm';
import { clientsApi, projectsApi } from '@/lib/api';
import { projectFields } from '../fields';
import { useEffect, useState } from 'react';

export default function NewProjectPage() {
  const [clientOptions, setClientOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    clientsApi.list({ limit: 100 }).then(({ data }) => setClientOptions(
      data.items.map((client: { id: string; name: string; englishName?: string }) => ({
        label: client.englishName || client.name || client.id,
        value: client.id,
      })),
    ));
  }, []);

  return (
    <EntityForm title="New Project" fields={projectFields(clientOptions)} isNew={true} backUrl="/dashboard/projects"
      onSubmit={async (data: Record<string, unknown>) => { await projectsApi.create(data); }} />
  );
}
