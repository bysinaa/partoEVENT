'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Upload, X, AlertCircle } from 'lucide-react';
import { API_BASE, resolveMediaUrl, fetchMediaUrl, invalidateMediaUrl } from '@/lib/media';

/** Extract the most specific message the API gave us, rather than a generic string. */
function extractApiError(err: unknown): string {
  const anyErr = err as any;
  const data = anyErr?.response?.data;
  if (data) {
    // Nest's ValidationPipe returns `message` as an array of constraint failures.
    if (Array.isArray(data.message)) return data.message.join('; ');
    if (typeof data.message === 'string') return data.message;
    if (typeof data.error === 'string') return data.error;
  }
  if (anyErr?.message) return anyErr.message;
  return 'Unexpected error';
}

/** Log full request context to the console; never log tokens. */
function logApiError(scope: string, err: unknown) {
  const anyErr = err as any;
  const cfg = anyErr?.config;
  console.error(`[${scope}] request failed`, {
    method: cfg?.method?.toUpperCase(),
    url: cfg?.baseURL ? `${cfg.baseURL}${cfg.url}` : cfg?.url,
    status: anyErr?.response?.status,
    statusText: anyErr?.response?.statusText,
    body: anyErr?.response?.data,
  });
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

async function uploadFile(file: File): Promise<{ id: string; url: string }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/media/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (Array.isArray(body.message)) detail = body.message.join('; ');
      else if (body.message) detail = body.message;
    } catch {
      // Response body was not JSON — keep the status line.
    }
    console.error('[upload] failed', { url: `${API_BASE}/media/upload`, status: res.status, detail });
    throw new Error(detail);
  }

  const result = await res.json();
  return { id: result.id, url: resolveMediaUrl(result.url || result.path || result.filename) };
}

function ImageUpload({ value, onChange }: { value?: string; onChange: (v: string | null) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');

  // `value` is normally a media id, which needs a lookup to become a URL.
  useEffect(() => {
    let active = true;
    if (!value) {
      setPreview('');
      return;
    }
    const direct = resolveMediaUrl(value);
    if (direct) {
      setPreview(direct);
      return;
    }
    fetchMediaUrl(value).then((url) => {
      if (active) setPreview(url);
    });
    return () => {
      active = false;
    };
  }, [value]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError(`Unsupported file type "${file.type || 'unknown'}". Use JPG, PNG, WebP, GIF or SVG.`);
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    setUploading(true);
    try {
      const result = await uploadFile(file);
      setPreview(result.url);
      onChange(result.id);
    } catch (err) {
      setError(`Upload failed: ${err instanceof Error ? err.message : 'unknown error'}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <input ref={fileRef} type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} className="hidden" onChange={handleFile} />
      {preview ? (

        <div className="relative group w-full h-40 rounded-lg border border-gray-200 dark:border-zinc-700 overflow-hidden bg-gray-50 dark:bg-zinc-800">
          <img src={preview} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} className="px-3 py-1 bg-white/90 rounded text-sm font-medium hover:bg-white">Replace</button>
            <button type="button" onClick={() => { invalidateMediaUrl(value); onChange(null); setPreview(''); }} className="px-3 py-1 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600"><X className="w-4 h-4" /></button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="w-full h-40 rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors flex flex-col items-center justify-center text-gray-400 dark:text-zinc-500 hover:text-blue-500 dark:hover:text-blue-400 bg-gray-50 dark:bg-zinc-800/50">
          {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <><Upload className="w-8 h-8 mb-2" /><span className="text-sm">Click to upload</span></>}
        </button>
      )}
      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-start gap-1">
          <AlertCircle className="w-3.5 h-3.5 mt-px shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}


export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'toggle' | 'image' | 'richtext';
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  span?: 'full' | 'half';
  nullableNumber?: boolean;
}

interface EntityFormProps {
  title: string;
  fields: FormField[];
  entity?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  backUrl: string;
  isNew?: boolean;
}

export default function EntityForm({ title, fields, entity, onSubmit, backUrl, isNew = false }: EntityFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const savingRef = useRef(false);


  useEffect(() => {
    if (entity) {
      const data: Record<string, any> = {};
      for (const field of fields) {
        const val = entity[field.name];
        if (field.type === 'multiselect') {
          data[field.name] = Array.isArray(val) ? val : [];
        } else if (field.type === 'toggle') {
          data[field.name] = val === true || val === 'true';
        } else if (field.type === 'number') {
          data[field.name] = val ?? (field.nullableNumber ? '' : 0);
        } else {
          data[field.name] = val ?? '';
        }
      }
      setFormData(data);
    } else {
      const data: Record<string, any> = {};
      for (const field of fields) {
        if (field.type === 'multiselect') data[field.name] = [];
        else if (field.type === 'toggle') data[field.name] = false;
        else if (field.type === 'number') data[field.name] = field.nullableNumber ? '' : 0;
        else data[field.name] = '';
      }
      setFormData(data);
    }
  }, [entity, fields]);

  const handleChange = useCallback((name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  /**
   * Optional relation ids arrive from empty inputs as ''. Prisma treats '' as a
   * real foreign key and the write fails, so normalise blanks to null.
   */
  const normalise = useCallback((data: Record<string, any>) => {
    const out: Record<string, any> = {};
    for (const field of fields) {
      const value = data[field.name];
      if (field.type === 'image') {
        out[field.name] = value === '' || value === undefined ? null : value;
      } else if (field.type === 'text' || field.type === 'textarea' || field.type === 'richtext') {
        // Keep required fields as-is so the API reports the missing value.
        out[field.name] = value === '' && !field.required ? null : value;
      } else if (field.type === 'number' && field.nullableNumber) {
        out[field.name] = value === '' || value === undefined ? null : value;
      } else if (field.type === 'select') {
        out[field.name] = value === '' ? undefined : value;
      } else {
        out[field.name] = value;
      }
    }
    // Never send undefined keys — they only add noise to the request body.
    return Object.fromEntries(Object.entries(out).filter(([, v]) => v !== undefined));
  }, [fields]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingRef.current) return; // guard against double submit
    savingRef.current = true;
    setSaving(true);
    setSaveError('');
    try {
      await onSubmit(normalise(formData));
      router.push(backUrl);
    } catch (err) {
      logApiError('EntityForm.save', err);
      setSaveError(extractApiError(err));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };


  return (
    <div className="min-h-full bg-gray-50 dark:bg-zinc-950">
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => router.push(backUrl)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 dark:text-zinc-500">{isNew ? 'Creating' : 'Editing'}</span>
            <button type="submit" form="entity-form" disabled={saving}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <form id="entity-form" onSubmit={handleSubmit} className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{title}</h1>

        {saveError && (
          <div role="alert" className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/40">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">Could not save</p>
              <p className="mt-0.5 text-sm text-red-700 dark:text-red-400">{saveError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div key={field.name} className={field.span === 'full' ? 'md:col-span-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.type === 'text' && (
                <input type="text" value={formData[field.name] || ''} onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder} required={field.required}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              )}

              {field.type === 'textarea' && (
                <textarea value={formData[field.name] || ''} onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder} required={field.required} rows={4}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
              )}

              {field.type === 'richtext' && (
                <textarea value={formData[field.name] || ''} onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder || 'Write content here...'} required={field.required} rows={10}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono" />
              )}

              {field.type === 'number' && (
                <input type="number" value={formData[field.name] ?? (field.nullableNumber ? '' : 0)} onChange={(e) => handleChange(field.name, e.target.value === '' && field.nullableNumber ? '' : +e.target.value)}
                  placeholder={field.placeholder} required={field.required}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              )}

              {field.type === 'select' && (
                <select value={formData[field.name] || ''} onChange={(e) => handleChange(field.name, e.target.value)} required={field.required}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select...</option>
                  {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              )}

              {field.type === 'multiselect' && (
                <div className="flex flex-wrap gap-2">
                  {field.options?.map(opt => {
                    const selected = (formData[field.name] || []).includes(opt.value);
                    return (
                      <button key={opt.value} type="button" onClick={() => {
                        const current = formData[field.name] || [];
                        const next = selected ? current.filter((v: string) => v !== opt.value) : [...current, opt.value];
                        handleChange(field.name, next);
                      }}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          selected
                            ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300'
                            : 'bg-white border-gray-200 text-gray-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400'
                        }`}>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {field.type === 'toggle' && (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={formData[field.name] || false} onChange={(e) => handleChange(field.name, e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                  <span className="ml-3 text-sm text-gray-700 dark:text-zinc-300">{formData[field.name] ? 'Active' : 'Inactive'}</span>
                </label>
              )}

              {field.type === 'image' && (
                <ImageUpload value={formData[field.name]} onChange={(v) => handleChange(field.name, v)} />

              )}
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}
