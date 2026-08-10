'use client';

import EntityForm, { FormField } from '@/components/EntityForm';
import { clientsApi, servicesApi } from '@/lib/api';
import { useEffect, useMemo, useState } from 'react';

const baseFields: FormField[] = [
  { name: 'name', label: 'Name (Farsi)', type: 'text', required: true, placeholder: 'نام شریت' },
  { name: 'englishName', label: 'Name (English)', type: 'text', placeholder: 'Company Name' },
  { name: 'slug', label: 'Slug', type: 'text', placeholder: 'auto-generated-from-english-name' },
  { name: 'descriptionEn', label: 'Description (English)', type: 'textarea', span: 'full' },
  { name: 'descriptionFa', label: 'Description (Farsi)', type: 'textarea', span: 'full' },
  { name: 'locationEn', label: 'Location (English)', type: 'text' },
  { name: 'locationFa', label: 'Location (Farsi)', type: 'text' },
  { name: 'website', label: 'Website', type: 'text', placeholder: 'https://example.com' },
  { name: 'logoId', label: 'Logo', type: 'image' },
  { name: 'coverImageId', label: 'Cover Image', type: 'image' },
  { name: 'status', label: 'Status', type: 'select', options: [
    { label: 'Published', value: 'PUBLISHED' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Archived', value: 'ARCHIVED' },
  ]},
  { name: 'displayOrder', label: 'Display Order', type: 'number' },
  { name: 'featured', label: 'Featured', type: 'toggle' },
];

export default function NewClientPage() {
  const [serviceOptions, setServiceOptions] = useState<{ label: string; value: string }[]>([]);
  useEffect(() => {
    servicesApi.list({ limit: 100 }).then(({ data }) => setServiceOptions(
      data.items.map((service: { id: string; titleEn: string; titleFa?: string }) => ({
        label: service.titleEn || service.titleFa || service.id,
        value: service.id,
      })),
    ));
  }, []);
  const fields = useMemo<FormField[]>(() => [
    ...baseFields,
    { name: 'serviceIds', label: 'Services', type: 'multiselect', options: serviceOptions, span: 'full' },
  ], [serviceOptions]);

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
