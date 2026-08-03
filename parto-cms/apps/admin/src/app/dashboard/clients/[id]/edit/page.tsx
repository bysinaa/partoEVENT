'use client';

import EntityForm, { FormField } from '@/components/EntityForm';
import { clientsApi } from '@/lib/api';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const fields: FormField[] = [
  { name: 'name', label: 'Name (Farsi)', type: 'text', required: true },
  { name: 'englishName', label: 'Name (English)', type: 'text', required: true },
  { name: 'slug', label: 'Slug', type: 'text' },
  { name: 'industry', label: 'Industry', type: 'text' },
  { name: 'descriptionEn', label: 'Description (English)', type: 'textarea', span: 'full' },
  { name: 'descriptionFa', label: 'Description (Farsi)', type: 'textarea', span: 'full' },
  { name: 'website', label: 'Website', type: 'text' },
  { name: 'logo', label: 'Logo', type: 'image' },
  { name: 'coverImage', label: 'Cover Image', type: 'image' },
  { name: 'status', label: 'Status', type: 'select', options: [
    { label: 'Published', value: 'PUBLISHED' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Archived', value: 'ARCHIVED' },
  ]},
  { name: 'displayOrder', label: 'Display Order', type: 'number' },
  { name: 'featured', label: 'Featured', type: 'toggle' },
  { name: 'contactName', label: 'Contact Person', type: 'text' },
  { name: 'contactEmail', label: 'Contact Email', type: 'text' },
  { name: 'contactPhone', label: 'Contact Phone', type: 'text' },
];

export default function EditClientPage() {
  const params = useParams();
  const id = params.id as string;
  const [entity, setEntity] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    clientsApi.getById(id).then(r => setEntity(r.data));
  }, [id]);

  if (!entity) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <EntityForm
      title="Edit Client"
      fields={fields}
      entity={entity}
      isNew={false}
      backUrl="/dashboard/clients"
      onSubmit={async (data: Record<string, unknown>) => {
        await clientsApi.update(id, data);
      }}
    />
  );
}