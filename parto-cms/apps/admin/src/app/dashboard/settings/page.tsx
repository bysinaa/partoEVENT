'use client';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-surface-900">Settings</h1>
        <p className="mt-1 text-sm text-surface-500">Configure your CMS and site settings</p>
      </div>
      <div className="rounded-xl border border-surface-300 bg-white p-12 text-center">
        <p className="text-sm text-surface-500">Settings management coming soon.</p>
        <p className="mt-1 text-xs text-surface-400">Configure site metadata, SEO defaults, social media links, and global settings.</p>
      </div>
    </div>
  );
}