'use client';

import EntityForm, { FormField } from '@/components/EntityForm';
import { servicesApi } from '@/lib/api';

const fields: FormField[] = [
  { name: 'titleEn', label: 'Title (English)', type: 'text', required: true, placeholder: 'Lighting Design' },
  { name: 'titleFa', label: 'Title (Farsi)', type: 'text', required: true, placeholder: 'طراحی نورپردازی' },
  { name: 'slug', label: 'Slug', type: 'text' },
  { name: 'descriptionEn', label: 'Description (English)', type: 'textarea', span: 'full' },
  { name: 'descriptionFa', label: 'Description (Farsi)', type: 'textarea', span: 'full' },
  { name: 'icon', label: 'Icon', type: 'text', placeholder: 'lucide icon name' },
  { name: 'image', label: 'Image', type: 'image' },
  { name: 'status', label: 'Status', type: 'select', options: [
    { label: 'Published', value: 'PUBLISHED' },
    { label: 'Draft', value: 'DRAFT' },
  ]},
  { name: 'order', label: 'Order', type: 'number' },
];

export default function NewServicePage() {
  return (
    <EntityForm
      title="New Service"
      fields={fields}
      isNew={true}
      backUrl="/dashboard/services"
      onSubmit={async (data: Record<string, unknown>) => { await servicesApi.create(data); }}
    />
  );
}