'use client';

import EntityForm, { FormField } from '@/components/EntityForm';
import { servicesApi } from '@/lib/api';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const fields: FormField[] = [
  { name: 'titleEn', label: 'Title (English)', type: 'text', required: true },
  { name: 'titleFa', label: 'Title (Farsi)', type: 'text' },
  { name: 'slug', label: 'Slug', type: 'text' },
  { name: 'descriptionEn', label: 'Description (English)', type: 'textarea', span: 'full' },
  { name: 'descriptionFa', label: 'Description (Farsi)', type: 'textarea', span: 'full' },
  { name: 'iconId', label: 'Icon Media ID', type: 'text' },
  { name: 'coverImageId', label: 'Cover Image', type: 'image' },
  { name: 'status', label: 'Status', type: 'select', options: [
    { label: 'Published', value: 'PUBLISHED' },
    { label: 'Draft', value: 'DRAFT' },
  ]},
  { name: 'order', label: 'Order', type: 'number' },
];

export default function EditServicePage() {
  const params = useParams();
  const id = params.id as string;
  const [entity, setEntity] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    servicesApi.getById(id).then((r: { data: Record<string, unknown> }) => setEntity(r.data));
  }, [id]);

  if (!entity) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  return (
    <EntityForm title="Edit Service" fields={fields} entity={entity} isNew={false} backUrl="/dashboard/services"
      onSubmit={async (data: Record<string, unknown>) => { await servicesApi.update(id, data); }} />
  );
}
