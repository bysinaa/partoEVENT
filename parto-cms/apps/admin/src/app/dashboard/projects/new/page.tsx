'use client';

import EntityForm, { FormField } from '@/components/EntityForm';
import { projectsApi } from '@/lib/api';

const fields: FormField[] = [
  { name: 'titleEn', label: 'Title (English)', type: 'text', required: true, placeholder: 'LED Stage Setup' },
  { name: 'titleFa', label: 'Title (Farsi)', type: 'text', required: true, placeholder: 'اجرای صحنه LED' },
  { name: 'slug', label: 'Slug', type: 'text' },
  { name: 'descriptionEn', label: 'Description (English)', type: 'textarea', span: 'full' },
  { name: 'descriptionFa', label: 'Description (Farsi)', type: 'textarea', span: 'full' },
  { name: 'contentEn', label: 'Content (English)', type: 'richtext', span: 'full' },
  { name: 'contentFa', label: 'Content (Farsi)', type: 'richtext', span: 'full' },
  { name: 'featuredImage', label: 'Featured Image', type: 'image' },
  { name: 'coverImage', label: 'Cover Image', type: 'image' },
  { name: 'clientName', label: 'Client Name', type: 'text' },
  { name: 'clientId', label: 'Client ID', type: 'text' },
  { name: 'locationEn', label: 'Location (English)', type: 'text' },
  { name: 'locationFa', label: 'Location (Farsi)', type: 'text' },
  { name: 'year', label: 'Year', type: 'number' },
  { name: 'servicesUsed', label: 'Services Used', type: 'multiselect', options: [
    { label: 'Lighting', value: 'LIGHTING' },
    { label: 'LED Display', value: 'LED_DISPLAY' },
    { label: 'Projection', value: 'PROJECTION' },
    { label: 'Audio', value: 'AUDIO' },
    { label: 'Stage Design', value: 'STAGE_DESIGN' },
    { label: 'Control Systems', value: 'CONTROL_SYSTEMS' },
  ]},
  { name: 'tags', label: 'Tags', type: 'multiselect', options: [
    { label: 'Indoor', value: 'indoor' },
    { label: 'Outdoor', value: 'outdoor' },
    { label: 'Concert', value: 'concert' },
    { label: 'Corporate', value: 'corporate' },
    { label: 'Festival', value: 'festival' },
  ]},
  { name: 'status', label: 'Status', type: 'select', options: [
    { label: 'Published', value: 'PUBLISHED' },
    { label: 'Draft', value: 'DRAFT' },
  ]},
  { name: 'displayOrder', label: 'Display Order', type: 'number' },
  { name: 'featured', label: 'Featured', type: 'toggle' },
];

export default function NewProjectPage() {
  return (
    <EntityForm title="New Project" fields={fields} isNew={true} backUrl="/dashboard/projects"
      onSubmit={async (data: Record<string, unknown>) => { await projectsApi.create(data); }} />
  );
}