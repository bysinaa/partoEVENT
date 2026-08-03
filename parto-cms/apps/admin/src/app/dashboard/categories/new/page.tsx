'use client';

import EntityForm, { FormField } from '@/components/EntityForm';
import { api } from '@/lib/api';

const fields: FormField[] = [
  { name: 'nameEn', label: 'Name (English)', type: 'text', required: true },
  { name: 'nameFa', label: 'Name (Farsi)', type: 'text', required: true },
  { name: 'slug', label: 'Slug', type: 'text' },
  { name: 'descriptionEn', label: 'Description (English)', type: 'textarea', span: 'full' },
  { name: 'descriptionFa', label: 'Description (Farsi)', type: 'textarea', span: 'full' },
  { name: 'type', label: 'Type', type: 'select', options: [
    { label: 'Blog', value: 'BLOG' },
    { label: 'Project', value: 'PROJECT' },
    { label: 'Service', value: 'SERVICE' },
    { label: 'Portfolio', value: 'PORTFOLIO' },
  ]},
  { name: 'image', label: 'Image', type: 'image' },
  { name: 'order', label: 'Order', type: 'number' },
];

const categoriesApi = {
  create: (data: Record<string, unknown>) => api.post('/categories', data),
};

export default function NewCategoryPage() {
  return (
    <EntityForm title="New Category" fields={fields} isNew={true} backUrl="/dashboard/categories"
      onSubmit={async (data: Record<string, unknown>) => { await categoriesApi.create(data); }} />
  );
}