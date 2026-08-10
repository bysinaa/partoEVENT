'use client';

import { useEffect, useState } from 'react';
import { Upload, Trash2, Search, Grid, List } from 'lucide-react';
import { mediaApi } from '@/lib/api';

const ACCEPTED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  'video/mp4', 'video/webm',
];

function uploadErrorMessage(error: any): string {
  const message = error?.response?.data?.message;
  return Array.isArray(message) ? message.join('; ') : message || error?.message || 'Upload failed';
}

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  mimeType?: string;
  size?: number;
  createdAt: string;
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const res = await mediaApi.list();
      setItems(Array.isArray(res.data) ? res.data : res.data?.items || []);
    } catch { setItems([]); } finally { setIsLoading(false); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError('Unsupported file type. Use JPG, PNG, WebP, GIF, SVG, MP4, or WebM.');
      e.target.value = '';
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await mediaApi.upload(formData);
      await loadItems();
    } catch (error) { setUploadError(uploadErrorMessage(error)); } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file?')) return;
    try { await mediaApi.delete(id); setItems(items.filter(i => i.id !== id)); } catch {}
  };

  const filtered = items.filter(i => i.filename?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-surface-900">Media Library</h1>
          <p className="mt-1 text-sm text-surface-500">Manage your images, videos, and files</p>
        </div>
        <label className="btn-primary cursor-pointer">
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? 'Uploading...' : 'Upload File'}
          <input type="file" className="hidden" onChange={handleUpload} accept={ACCEPTED_TYPES.join(',')} />
        </label>
      </div>
      {uploadError ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {uploadError}
        </p>
      ) : null}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500" />
        <input type="text" placeholder="Search files..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-10" />
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-surface-300 border-t-brand-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-surface-500">No media files yet</p>
          <p className="mt-1 text-xs text-surface-400">Upload your first file to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map((item) => (
            <div key={item.id} className="group relative rounded-xl border border-surface-300 bg-white overflow-hidden">
              <div className="aspect-square bg-surface-100 flex items-center justify-center">
                {item.mimeType?.startsWith('image/') ? (
                  <img src={item.url} alt={item.filename} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-surface-500">{item.mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs text-surface-700 truncate">{item.filename}</p>
                <p className="text-[10px] text-surface-400">{item.size ? `${(item.size / 1024).toFixed(1)} KB` : ''}</p>
              </div>
              <button onClick={() => handleDelete(item.id)} className="absolute top-2 right-2 rounded-lg bg-black/50 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
