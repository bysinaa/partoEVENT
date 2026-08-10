'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { settingsApi } from '@/lib/api';
import {
  THEME_OPTIONS,
  TYPOGRAPHY_PRESET_OPTIONS,
  FA_FONT_OPTIONS,
  EN_FONT_OPTIONS,
  THEME_DEFAULT_PRESET,
} from './themes';

type SettingsMap = Record<string, any>;

const BOOLEAN_KEYS = [
  'showPhone',
  'showEmail',
  'showWhatsapp',
  'showTelegram',
  'showInstagram',
  'showMap',
];

const DEFAULTS: SettingsMap = {
  websiteTheme: 'solar-refined',
  typographyPreset: 'editorial',
  fontFaHeading: 'peyda',
  fontFaBody: 'peyda',
  fontEnHeading: 'peydaLatin',
  fontEnBody: 'peydaLatin',
  contactTitle: '',
  contactTitleEn: '',
  contactDescription: '',
  contactDescriptionEn: '',
  phone: '',
  email: '',
  address: '',
  addressEn: '',
  workingHours: '',
  workingHoursEn: '',
  contactCtaPrimary: '',
  contactCtaPrimaryEn: '',
  contactCtaSecondary: '',
  contactCtaSecondaryEn: '',
  whatsapp: '',
  telegram: '',
  instagram: '',
  mapUrl: '',
  showPhone: true,
  showEmail: true,
  showWhatsapp: true,
  showTelegram: true,
  showInstagram: true,
  showMap: false,
};

/** The API stores booleans as the strings 'true'/'false'. */
function toBoolean(value: any): boolean {
  return value === true || value === 'true';
}

export default function SettingsPage() {
  const [values, setValues] = useState<SettingsMap>(DEFAULTS);
  const [initial, setInitial] = useState<SettingsMap>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await settingsApi.list();
        const loaded: SettingsMap = { ...DEFAULTS };

        // The list endpoint returns rows, not a map.
        for (const row of Array.isArray(data) ? data : []) {
          if (!(row.key in DEFAULTS)) continue;
          loaded[row.key] = BOOLEAN_KEYS.includes(row.key)
            ? toBoolean(row.value)
            : row.value;
        }

        if (!cancelled) {
          setValues(loaded);
          setInitial(loaded);
        }
      } catch {
        // An empty settings table is normal on a fresh install, so this is not
        // surfaced as an error — the form just shows defaults.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const set = useCallback((key: string, value: any) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
    setError(null);
  }, []);

  /** Only send what actually changed, so a save cannot clobber concurrent edits. */
  const changed = useMemo(() => {
    const diff: SettingsMap = {};
    for (const key of Object.keys(values)) {
      if (values[key] !== initial[key]) diff[key] = values[key];
    }
    return diff;
  }, [values, initial]);

  const isDirty = Object.keys(changed).length > 0;

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await settingsApi.updateMany(changed);
      setInitial(values);
      setSuccess(true);
    } catch (err: any) {
      const payload = err?.response?.data;
      setError(payload?.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function selectTheme(themeId: string) {
    setValues((prev) => ({
      ...prev,
      websiteTheme: themeId,
      // Follow the theme's typography personality unless the editor already
      // chose a preset different from the previous theme's default.
      typographyPreset:
        prev.typographyPreset === THEME_DEFAULT_PRESET[prev.websiteTheme]
          ? THEME_DEFAULT_PRESET[themeId] ?? prev.typographyPreset
          : prev.typographyPreset,
    }));
    setSuccess(false);
    setError(null);
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-sm text-surface-500">
        Loading settings…
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      <div>
        <h1 className="text-2xl font-semibold text-surface-900">Settings</h1>
        <p className="mt-1 text-sm text-surface-500">
          Theme, typography and contact details for the public website.
        </p>
      </div>

      {/* ─── Website theme ─────────────────────── */}
      <section className="rounded-xl border border-surface-300 bg-white p-6">
        <h2 className="text-lg font-medium text-surface-900">Website Theme</h2>
        <p className="mt-1 text-sm text-surface-500">
          One theme is active at a time. Changes apply after saving and reloading
          the website — no redeploy needed.
        </p>

        <div
          role="radiogroup"
          aria-label="Website theme"
          className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {THEME_OPTIONS.map((theme) => {
            const active = values.websiteTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => selectTheme(theme.id)}
                className={`rounded-lg border p-3 text-start transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  active
                    ? 'border-surface-900 ring-2 ring-surface-900'
                    : 'border-surface-300 hover:border-surface-500'
                }`}
              >
                <span className="flex gap-1" aria-hidden="true">
                  {theme.swatches.map((color, i) => (
                    <span
                      key={i}
                      className="h-6 w-6 rounded border border-black/10"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </span>
                <span className="mt-2 block text-sm font-medium text-surface-900">
                  {theme.label}
                </span>
                <span className="mt-0.5 block text-xs text-surface-500">
                  {theme.description}
                </span>
                <span className="mt-1 block text-[11px] uppercase tracking-wide text-surface-400">
                  {theme.mode}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── Typography ────────────────────────── */}
      <section className="rounded-xl border border-surface-300 bg-white p-6">
        <h2 className="text-lg font-medium text-surface-900">Typography</h2>
        <p className="mt-1 text-sm text-surface-500">
          Persian and English fonts are chosen separately so each script keeps
          correct shaping and alignment.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Typography preset"
            value={values.typographyPreset}
            onChange={(v) => set('typographyPreset', v)}
            options={TYPOGRAPHY_PRESET_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
          />
          <div />
          <Select
            label="Persian heading font"
            value={values.fontFaHeading}
            onChange={(v) => set('fontFaHeading', v)}
            options={FA_FONT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
          <Select
            label="Persian body font"
            value={values.fontFaBody}
            onChange={(v) => set('fontFaBody', v)}
            options={FA_FONT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
          <Select
            label="English heading font"
            value={values.fontEnHeading}
            onChange={(v) => set('fontEnHeading', v)}
            options={EN_FONT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
          <Select
            label="English body font"
            value={values.fontEnBody}
            onChange={(v) => set('fontEnBody', v)}
            options={EN_FONT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
        </div>
      </section>

      {/* ─── Contact ───────────────────────────── */}
      <section className="rounded-xl border border-surface-300 bg-white p-6">
        <h2 className="text-lg font-medium text-surface-900">Contact</h2>
        <p className="mt-1 text-sm text-surface-500">
          Used by both the Contact section and the footer. Empty or hidden
          channels are omitted from the website entirely.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Title (Persian)" dir="rtl" value={values.contactTitle} onChange={(v) => set('contactTitle', v)} />
          <Field label="Title (English)" value={values.contactTitleEn} onChange={(v) => set('contactTitleEn', v)} />
          <Textarea label="Description (Persian)" dir="rtl" value={values.contactDescription} onChange={(v) => set('contactDescription', v)} />
          <Textarea label="Description (English)" value={values.contactDescriptionEn} onChange={(v) => set('contactDescriptionEn', v)} />
          <Field label="Address (Persian)" dir="rtl" value={values.address} onChange={(v) => set('address', v)} />
          <Field label="Address (English)" value={values.addressEn} onChange={(v) => set('addressEn', v)} />
          <Field label="Working hours (Persian)" dir="rtl" value={values.workingHours} onChange={(v) => set('workingHours', v)} />
          <Field label="Working hours (English)" value={values.workingHoursEn} onChange={(v) => set('workingHoursEn', v)} />
          <Field label="Primary CTA (Persian)" dir="rtl" value={values.contactCtaPrimary} onChange={(v) => set('contactCtaPrimary', v)} />
          <Field label="Primary CTA (English)" value={values.contactCtaPrimaryEn} onChange={(v) => set('contactCtaPrimaryEn', v)} />
          <Field label="Secondary CTA (Persian)" dir="rtl" value={values.contactCtaSecondary} onChange={(v) => set('contactCtaSecondary', v)} />
          <Field label="Secondary CTA (English)" value={values.contactCtaSecondaryEn} onChange={(v) => set('contactCtaSecondaryEn', v)} />
        </div>
      </section>

      {/* ─── Channels ──────────────────────────── */}
      <section className="rounded-xl border border-surface-300 bg-white p-6">
        <h2 className="text-lg font-medium text-surface-900">Channels</h2>
        <p className="mt-1 text-sm text-surface-500">
          Enter a full link or just a username — links are normalized
          automatically.
        </p>

        <div className="mt-4 space-y-4">
          <Channel label="Phone" placeholder="+98 21 1234 5678" value={values.phone} onChange={(v) => set('phone', v)} shown={values.showPhone} onToggle={(v) => set('showPhone', v)} />
          <Channel label="Email" placeholder="hello@parto.com" value={values.email} onChange={(v) => set('email', v)} shown={values.showEmail} onToggle={(v) => set('showEmail', v)} />
          <Channel label="WhatsApp" placeholder="+989120000000 or wa.me link" value={values.whatsapp} onChange={(v) => set('whatsapp', v)} shown={values.showWhatsapp} onToggle={(v) => set('showWhatsapp', v)} />
          <Channel label="Telegram" placeholder="@parto or t.me link" value={values.telegram} onChange={(v) => set('telegram', v)} shown={values.showTelegram} onToggle={(v) => set('showTelegram', v)} />
          <Channel label="Instagram" placeholder="@parto or instagram.com link" value={values.instagram} onChange={(v) => set('instagram', v)} shown={values.showInstagram} onToggle={(v) => set('showInstagram', v)} />
          <Channel label="Map URL" placeholder="https://maps.google.com/…" value={values.mapUrl} onChange={(v) => set('mapUrl', v)} shown={values.showMap} onToggle={(v) => set('showMap', v)} />
        </div>
      </section>

      {/* ─── Save bar ──────────────────────────── */}
      <div className="sticky bottom-0 -mx-6 border-t border-surface-300 bg-white/95 px-6 py-4 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="rounded-lg bg-surface-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>

          {isDirty && !saving && (
            <span className="text-sm text-surface-500">
              {Object.keys(changed).length} unsaved change
              {Object.keys(changed).length === 1 ? '' : 's'}
            </span>
          )}

          {success && (
            <span role="status" className="text-sm text-green-700">
              Saved. Reload the website to see the changes.
            </span>
          )}

          {error && (
            <span role="alert" className="text-sm text-red-700">
              {error}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Small form primitives ──────────────────

function Field({
  label,
  value,
  onChange,
  placeholder,
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  dir?: 'rtl' | 'ltr';
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-surface-700">{label}</span>
      <input
        type="text"
        dir={dir}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-surface-900 focus:outline-none focus:ring-1 focus:ring-surface-900"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  dir?: 'rtl' | 'ltr';
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-surface-700">{label}</span>
      <textarea
        dir={dir}
        rows={3}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-surface-900 focus:outline-none focus:ring-1 focus:ring-surface-900"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-surface-700">{label}</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-surface-900 focus:outline-none focus:ring-1 focus:ring-surface-900"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Channel({
  label,
  value,
  onChange,
  placeholder,
  shown,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  shown: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-surface-200 p-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Field label={label} value={value} onChange={onChange} placeholder={placeholder} dir="ltr" />
      </div>
      <label className="flex items-center gap-2 whitespace-nowrap pb-2 text-sm text-surface-700">
        <input
          type="checkbox"
          checked={!!shown}
          onChange={(e) => onToggle(e.target.checked)}
          className="h-4 w-4 rounded border-surface-300"
        />
        Show on site
      </label>
    </div>
  );
}
