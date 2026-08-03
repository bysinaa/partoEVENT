'use client';

import EntityForm, { FormField } from '@/components/EntityForm';
import { clientsApi } from '@/lib/api';

const fields: FormField[] = [
  { name: 'name', label: 'Name (Farsi)', type: 'text', required: true, placeholder: 'نام شریت' },
  { name: 'englishName', label: 'Name (English)', type: 'text', required: true, placeholder: 'Company Name' },
  { name: 'slug', label: 'Slug', type: 'text', placeholder: 'auto-generated-from-english-name' },
  { name: 'industry', label: 'Industry', type: 'text', placeholder: 'Event Production, etc.' },
  { name: 'descriptionEn', label: 'Description (English)', type: 'textarea', span: 'full' },
  { name: 'descriptionFa', label: 'Description (Farsi)', type: 'textarea', span: 'full' },
  { name: 'website', label: 'Website', type: 'text', placeholder: 'https://example.com' },
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

export default function NewClientPage() {
  return (
    <EntityForm
      title="New Client"
      fields={fields}
      isNew={true}
      backUrl="/dashboard/clients"
      onSubmit={async (data: Record<string, unknown>) => {
        await clientsApi.create(data);
      }}
    />
  );
}