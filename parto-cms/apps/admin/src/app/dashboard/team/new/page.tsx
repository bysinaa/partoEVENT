'use client';

import EntityForm, { FormField } from '@/components/EntityForm';
import { teamApi } from '@/lib/api';

const fields: FormField[] = [
  { name: 'nameEn', label: 'Name (English)', type: 'text', required: true },
  { name: 'nameFa', label: 'Name (Farsi)', type: 'text' },
  { name: 'positionEn', label: 'Position (English)', type: 'text' },
  { name: 'positionFa', label: 'Position (Farsi)', type: 'text' },
  { name: 'biographyEn', label: 'Biography (English)', type: 'textarea', span: 'full' },
  { name: 'biographyFa', label: 'Biography (Farsi)', type: 'textarea', span: 'full' },
  { name: 'photoId', label: 'Photo', type: 'image' },
  { name: 'email', label: 'Email', type: 'text' },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'instagram', label: 'Instagram', type: 'text' },
  { name: 'linkedin', label: 'LinkedIn', type: 'text' },
  { name: 'twitter', label: 'Twitter', type: 'text' },
  { name: 'order', label: 'Order', type: 'number' },
];

export default function NewTeamPage() {
  return (
    <EntityForm title="New Team Member" fields={fields} isNew={true} backUrl="/dashboard/team"
      onSubmit={async (data: Record<string, unknown>) => { await teamApi.create(data); }} />
  );
}
