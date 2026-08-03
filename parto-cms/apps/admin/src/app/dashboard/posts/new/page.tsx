'use client';

import EntityForm, { FormField } from '@/components/EntityForm';
import { postsApi } from '@/lib/api';

const fields: FormField[] = [
  { name: 'titleEn', label: 'Title (English)', type: 'text', required: true },
  { name: 'titleFa', label: 'Title (Farsi)', type: 'text', required: true },
  { name: 'slug', label: 'Slug', type: 'text' },
  { name: 'excerptEn', label: 'Excerpt (English)', type: 'textarea' },
  { name: 'excerptFa', label: 'Excerpt (Farsi)', type: 'textarea' },
  { name: 'contentEn', label: 'Content (English)', type: 'richtext', span: 'full' },
  { name: 'contentFa', label: 'Content (Farsi)', type: 'richtext', span: 'full' },
  { name: 'featuredImage', label: 'Featured Image', type: 'image' },
  { name: 'status', label: 'Status', type: 'select', options: [
    { label: 'Published', value: 'PUBLISHED' },
    { label: 'Draft', value: 'DRAFT' },
  ]},
];

export default function NewPostPage() {
  return (
    <EntityForm title="New Post" fields={fields} isNew={true} backUrl="/dashboard/posts"
      onSubmit={async (data: Record<string, unknown>) => { await postsApi.create(data); }} />
  );
}