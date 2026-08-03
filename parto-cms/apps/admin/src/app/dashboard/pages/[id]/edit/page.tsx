'use client';

import EntityForm, { FormField } from '@/components/EntityForm';
import { pagesApi } from '@/lib/api';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const fields: FormField[] = [
  { name: 'titleEn', label: 'Title (English)', type: 'text', required: true },
  { name: 'titleFa', label: 'Title (Farsi)', type: 'text', required: true },
  { name: 'slug', label: 'Slug', type: 'text' },
  { name: 'contentEn', label: 'Content (English)', type: 'richtext', span: 'full' },
  { name: 'contentFa', label: 'Content (Farsi)', type: 'richtext', span: 'full' },
  { name: 'excerptEn', label: 'Excerpt (English)', type: 'textarea' },
  { name: 'excerptFa', label: 'Excerpt (Farsi)', type: 'textarea' },
  { name: 'featuredImage', label: 'Featured Image', type: 'image' },
  { name: 'status', label: 'Status', type: 'select', options: [
    { label: 'Published', value: 'PUBLISHED' }, { label: 'Draft', value: 'DRAFT' },
  ]},
];

export default function EditPagePage() {
  const params = useParams();
  const id = params.id as string;
  const [entity, setEntity] = useState<Record<string, unknown> | null>(null);

  useEffect(() => { pagesApi.getById(id).then((r: { data: Record<string, unknown> }) => setEntity(r.data)); }, [id]);

  if (!entity) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  return (
    <EntityForm title="Edit Page" fields={fields} entity={entity} isNew={false} backUrl="/dashboard/pages"
      onSubmit={async (data: Record<string, unknown>) => { await pagesApi.update(id, data); }} />
  );
}