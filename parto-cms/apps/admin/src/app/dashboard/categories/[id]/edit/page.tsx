'use client';

import EntityForm, { FormField } from '@/components/EntityForm';
import { api } from '@/lib/api';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const fields: FormField[] = [
  { name: 'nameEn', label: 'Name (English)', type: 'text', required: true },
  { name: 'nameFa', label: 'Name (Farsi)', type: 'text', required: true },
  { name: 'slug', label: 'Slug', type: 'text' },
  { name: 'descriptionEn', label: 'Description (English)', type: 'textarea', span: 'full' },
  { name: 'descriptionFa', label: 'Description (Farsi)', type: 'textarea', span: 'full' },
  { name: 'type', label: 'Type', type: 'select', options: [
    { label: 'Blog', value: 'BLOG' }, { label: 'Project', value: 'PROJECT' },
    { label: 'Service', value: 'SERVICE' }, { label: 'Portfolio', value: 'PORTFOLIO' },
  ]},
  { name: 'image', label: 'Image', type: 'image' },
  { name: 'order', label: 'Order', type: 'number' },
];

export default function EditCategoryPage() {
  const params = useParams();
  const id = params.id as string;
  const [entity, setEntity] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    api.get(`/categories/${id}`).then((r: { data: Record<string, unknown> }) => setEntity(r.data));
  }, [id]);

  if (!entity) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  return (
    <EntityForm title="Edit Category" fields={fields} entity={entity} isNew={false} backUrl="/dashboard/categories"
      onSubmit={async (data: Record<string, unknown>) => { await api.patch(`/categories/${id}`, data); }} />
  );
}