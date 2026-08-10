'use client';

import EntityForm, { FormField } from '@/components/EntityForm';
import { clientsApi, servicesApi } from '@/lib/api';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';

const baseFields: FormField[] = [
  { name: 'name', label: 'Name (Farsi)', type: 'text', required: true },
  { name: 'englishName', label: 'Name (English)', type: 'text' },
  { name: 'slug', label: 'Slug', type: 'text' },
  { name: 'descriptionEn', label: 'Description (English)', type: 'textarea', span: 'full' },
  { name: 'descriptionFa', label: 'Description (Farsi)', type: 'textarea', span: 'full' },
  { name: 'locationEn', label: 'Location (English)', type: 'text' },
  { name: 'locationFa', label: 'Location (Farsi)', type: 'text' },
  { name: 'website', label: 'Website', type: 'text' },
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

export default function EditClientPage() {
  const params = useParams();
  const id = params.id as string;
  const [entity, setEntity] = useState<Record<string, unknown> | null>(null);
  const [serviceOptions, setServiceOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    clientsApi.getById(id).then(({ data }) => setEntity({
      ...data,
      serviceIds: data.serviceIds ?? data.clientServices?.map(({ serviceId }: { serviceId: string }) => serviceId) ?? [],
    }));
    servicesApi.list({ limit: 100 }).then(({ data }) => setServiceOptions(
      data.items.map((service: { id: string; titleEn: string; titleFa?: string }) => ({
        label: service.titleEn || service.titleFa || service.id,
        value: service.id,
      })),
    ));
  }, [id]);
  const fields = useMemo<FormField[]>(() => [
    ...baseFields,
    { name: 'serviceIds', label: 'Services', type: 'multiselect', options: serviceOptions, span: 'full' },
  ], [serviceOptions]);

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
