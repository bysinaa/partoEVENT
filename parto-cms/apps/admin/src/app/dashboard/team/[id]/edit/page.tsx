'use client';

import EntityForm, { FormField } from '@/components/EntityForm';
import { teamApi } from '@/lib/api';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const fields: FormField[] = [
  { name: 'nameEn', label: 'Name (English)', type: 'text', required: true },
  { name: 'nameFa', label: 'Name (Farsi)', type: 'text', required: true },
  { name: 'positionEn', label: 'Position (English)', type: 'text' },
  { name: 'positionFa', label: 'Position (Farsi)', type: 'text' },
  { name: 'bioEn', label: 'Bio (English)', type: 'textarea', span: 'full' },
  { name: 'bioFa', label: 'Bio (Farsi)', type: 'textarea', span: 'full' },
  { name: 'image', label: 'Photo', type: 'image' },
  { name: 'email', label: 'Email', type: 'text' },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'order', label: 'Order', type: 'number' },
];

export default function EditTeamPage() {
  const params = useParams();
  const id = params.id as string;
  const [entity, setEntity] = useState<Record<string, unknown> | null>(null);

  useEffect(() => { teamApi.getById(id).then((r: { data: Record<string, unknown> }) => setEntity(r.data)); }, [id]);

  if (!entity) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  return (
    <EntityForm title="Edit Team Member" fields={fields} entity={entity} isNew={false} backUrl="/dashboard/team"
      onSubmit={async (data: Record<string, unknown>) => { await teamApi.update(id, data); }} />
  );
}