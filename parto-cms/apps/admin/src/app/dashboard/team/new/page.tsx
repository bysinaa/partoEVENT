'use client';

import EntityForm, { FormField } from '@/components/EntityForm';
import { teamApi } from '@/lib/api';

const fields: FormField[] = [
  { name: 'nameEn', label: 'Name (English)', type: 'text', required: true },
  { name: 'nameFa', label: 'Name (Farsi)', type: 'text', required: true },
  { name: 'positionEn', label: 'Position (English)', type: 'text' },
  { name: 'positionFa', label: 'Position (Farsi)', type: 'text' },
  { name: 'bioEn', label: 'Bio (English)', type: 'textarea', span: 'full' },
  { name: 'bioFa', label: 'Bio (Farsi)', type: 'textarea', span: 'full' },
  { name: 'image', label: 'Photo', type: 'image' },
  { name: 'email', label: 'Email', type: 'text' },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'order', label: 'Order', type: 'number' },
];

export default function NewTeamPage() {
  return (
    <EntityForm title="New Team Member" fields={fields} isNew={true} backUrl="/dashboard/team"
      onSubmit={async (data: Record<string, unknown>) => { await teamApi.create(data); }} />
  );
}