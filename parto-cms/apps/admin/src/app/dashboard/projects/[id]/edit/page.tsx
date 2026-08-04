'use client';

import EntityForm from '@/components/EntityForm';
import { projectsApi } from '@/lib/api';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { projectFields } from '../../fields';

export default function EditProjectPage() {
  const params = useParams();
  const id = params.id as string;
  const [entity, setEntity] = useState<Record<string, unknown> | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    projectsApi
      .getById(id)
      .then((r: { data: Record<string, unknown> }) => {
        if (active) setEntity(r.data);
      })
      .catch((err: unknown) => {
        console.error('[projects.edit] failed to load', err);
        const anyErr = err as { response?: { status?: number; data?: { message?: string } } };
        if (active) {
          setLoadError(
            anyErr?.response?.status === 404
              ? 'This project no longer exists.'
              : anyErr?.response?.data?.message || 'Could not load this project.',
          );
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loadError) {
    return (
      <div className="mx-auto mt-12 flex max-w-lg items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/40">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
        <div>
          <p className="text-sm font-medium text-red-800 dark:text-red-300">Could not load project</p>
          <p className="mt-0.5 text-sm text-red-700 dark:text-red-400">{loadError}</p>
        </div>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <EntityForm title="Edit Project" fields={projectFields} entity={entity} isNew={false} backUrl="/dashboard/projects"
      onSubmit={async (data: Record<string, unknown>) => { await projectsApi.update(id, data); }} />
  );
}
