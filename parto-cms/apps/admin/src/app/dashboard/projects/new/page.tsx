'use client';

import EntityForm from '@/components/EntityForm';
import { projectsApi } from '@/lib/api';
import { projectFields } from '../fields';

export default function NewProjectPage() {
  return (
    <EntityForm title="New Project" fields={projectFields} isNew={true} backUrl="/dashboard/projects"
      onSubmit={async (data: Record<string, unknown>) => { await projectsApi.create(data); }} />
  );
}
