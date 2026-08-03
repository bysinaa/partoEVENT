'use client';

import EntityForm, { FormField } from '@/components/EntityForm';
import { projectsApi } from '@/lib/api';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const fields: FormField[] = [
  { name: 'titleEn', label: 'Title (English)', type: 'text', required: true },
  { name: 'titleFa', label: 'Title (Farsi)', type: 'text', required: true },
  { name: 'slug', label: 'Slug', type: 'text' },
  { name: 'descriptionEn', label: 'Description (English)', type: 'textarea', span: 'full' },
  { name: 'descriptionFa', label: 'Description (Farsi)', type: 'textarea', span: 'full' },
  { name: 'contentEn', label: 'Content (English)', type: 'richtext', span: 'full' },
  { name: 'contentFa', label: 'Content (Farsi)', type: 'richtext', span: 'full' },
  { name: 'featuredImage', label: 'Featured Image', type: 'image' },
  { name: 'coverImage', label: 'Cover Image', type: 'image' },
  { name: 'clientName', label: 'Client Name', type: 'text' },
  { name: 'locationEn', label: 'Location (English)', type: 'text' },
  { name: 'locationFa', label: 'Location (Farsi)', type: 'text' },
  { name: 'year', label: 'Year', type: 'number' },
  { name: 'servicesUsed', label: 'Services Used', type: 'multiselect', options: [
    { label: 'Lighting', value: 'LIGHTING' }, { label: 'LED Display', value: 'LED_DISPLAY' },
    { label: 'Projection', value: 'PROJECTION' }, { label: 'Audio', value: 'AUDIO' },
    { label: 'Stage Design', value: 'STAGE_DESIGN' }, { label: 'Control Systems', value: 'CONTROL_SYSTEMS' },
  ]},
  { name: 'tags', label: 'Tags', type: 'multiselect', options: [
    { label: 'Indoor', value: 'indoor' }, { label: 'Outdoor', value: 'outdoor' },
    { label: 'Concert', value: 'concert' }, { label: 'Corporate', value: 'corporate' },
  ]},
  { name: 'status', label: 'Status', type: 'select', options: [
    { label: 'Published', value: 'PUBLISHED' }, { label: 'Draft', value: 'DRAFT' },
  ]},
  { name: 'displayOrder', label: 'Display Order', type: 'number' },
  { name: 'featured', label: 'Featured', type: 'toggle' },
];

export default function EditProjectPage() {
  const params = useParams();
  const id = params.id as string;
  const [entity, setEntity] = useState<Record<string, unknown> | null>(null);

  useEffect(() => { projectsApi.getById(id).then((r: { data: Record<string, unknown> }) => setEntity(r.data)); }, [id]);

  if (!entity) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  return (
    <EntityForm title="Edit Project" fields={fields} entity={entity} isNew={false} backUrl="/dashboard/projects"
      onSubmit={async (data: Record<string, unknown>) => { await projectsApi.update(id, data); }} />
  );
}