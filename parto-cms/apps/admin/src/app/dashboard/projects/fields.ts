import type { FormField } from '@/components/EntityForm';

// Shared by the "new" and "edit" pages so the two can never drift apart.
//
// Every `name` must match `CreateProjectDto` / `model Project` exactly. The API
// runs with `forbidNonWhitelisted: true`, so an unknown property is a hard 400
// — that mismatch is what previously made every project save fail.
const baseProjectFields: FormField[] = [
  { name: 'titleEn', label: 'Title (English)', type: 'text', required: true, placeholder: 'LED Stage Setup' },
  { name: 'titleFa', label: 'Title (Farsi)', type: 'text', placeholder: 'اجرای صحنه LED' },
  { name: 'slug', label: 'Slug', type: 'text', placeholder: 'led-stage-setup' },
  { name: 'descriptionEn', label: 'Description (English)', type: 'textarea', span: 'full' },
  { name: 'descriptionFa', label: 'Description (Farsi)', type: 'textarea', span: 'full' },
  { name: 'thumbnailId', label: 'Thumbnail', type: 'image' },
  { name: 'coverImageId', label: 'Cover Image', type: 'image' },
  { name: 'locationEn', label: 'Location (English)', type: 'text' },
  { name: 'locationFa', label: 'Location (Farsi)', type: 'text' },
  { name: 'year', label: 'Year', type: 'number', nullableNumber: true },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Published', value: 'PUBLISHED' },
      { label: 'Draft', value: 'DRAFT' },
      { label: 'In Review', value: 'IN_REVIEW' },
      { label: 'Archived', value: 'ARCHIVED' },
    ],
  },
  { name: 'isFeatured', label: 'Featured', type: 'toggle' },
  { name: 'seoTitleEn', label: 'SEO Title (English)', type: 'text' },
  { name: 'seoTitleFa', label: 'SEO Title (Farsi)', type: 'text' },
  { name: 'seoDescEn', label: 'SEO Description (English)', type: 'textarea', span: 'full' },
  { name: 'seoDescFa', label: 'SEO Description (Farsi)', type: 'textarea', span: 'full' },
];

export const projectFields = (clientOptions: FormField['options']): FormField[] => [
  ...baseProjectFields.slice(0, 7),
  { name: 'clientIds', label: 'Clients', type: 'multiselect', options: clientOptions, span: 'full' },
  ...baseProjectFields.slice(7),
];
