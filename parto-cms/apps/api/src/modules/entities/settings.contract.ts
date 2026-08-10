// ============================================
// Site Settings — Canonical Contract
//
// `SiteSetting` is a key/value table, so nothing here needs a migration.
// This file is the single place that decides:
//   1. which keys exist,
//   2. how each key is validated,
//   3. which keys are safe to expose on the PUBLIC endpoint.
//
// Anything not listed in PUBLIC_SETTING_KEYS is treated as CMS-only and is
// never returned by /api/public/settings.
// ============================================

/** The eight selectable website themes. Must stay in sync with the frontend. */
export const THEME_IDS = [
  'solar-refined',
  'warm-light',
  'deep-night',
  'minimal-mono',
  'aurora-green',
  'soft-lilac',
  'steel-blue',
  'sand-dune',
] as const;

export const FALLBACK_THEME_ID = 'solar-refined';

export const TYPOGRAPHY_PRESETS = ['editorial', 'grotesk', 'humanist'] as const;

/** Font stacks valid for Persian slots. */
export const FA_FONT_KEYS = ['peyda', 'peydaTight', 'systemFa'] as const;

/** Font stacks valid for Latin slots. */
export const EN_FONT_KEYS = [
  'peydaLatin',
  'systemSans',
  'systemSerif',
  'systemMono',
] as const;

type Validator = (value: unknown) => string | null;

const oneOf =
  (allowed: readonly string[]): Validator =>
  (value) =>
    typeof value === 'string' && allowed.includes(value)
      ? null
      : `must be one of: ${allowed.join(', ')}`;

const isString =
  (maxLength = 2000): Validator =>
  (value) => {
    if (typeof value !== 'string') return 'must be a string';
    if (value.length > maxLength) return `must be at most ${maxLength} characters`;
    return null;
  };

const isBoolean: Validator = (value) =>
  typeof value === 'boolean' || value === 'true' || value === 'false'
    ? null
    : 'must be a boolean';

const isEmail: Validator = (value) => {
  if (typeof value !== 'string') return 'must be a string';
  if (value === '') return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'must be a valid email address';
};

/**
 * Reject dangerous URL schemes. Empty is allowed so an editor can clear a field.
 * Bare handles/usernames are also allowed — the frontend normalizes those.
 */
const isSafeUrlOrHandle: Validator = (value) => {
  if (typeof value !== 'string') return 'must be a string';
  if (value === '') return null;

  if (/^https?:\/\//i.test(value)) return null;

  // Anything else must look like a handle, never a scheme such as javascript:.
  if (value.includes(':')) return 'must be an http(s) URL or a plain username';

  return /^@?[A-Za-z0-9._/+-]+$/.test(value)
    ? null
    : 'must be an http(s) URL or a plain username';
};

const isUrl: Validator = (value) => {
  if (typeof value !== 'string') return 'must be a string';
  if (value === '') return null;
  return /^https?:\/\//i.test(value) ? null : 'must be an http(s) URL';
};

/** Every known setting key and its validator. */
export const SETTING_VALIDATORS: Record<string, Validator> = {
  // ─── Appearance ───────────────────────────
  websiteTheme: oneOf(THEME_IDS),
  typographyPreset: oneOf(TYPOGRAPHY_PRESETS),
  fontFaHeading: oneOf(FA_FONT_KEYS),
  fontFaBody: oneOf(FA_FONT_KEYS),
  fontEnHeading: oneOf(EN_FONT_KEYS),
  fontEnBody: oneOf(EN_FONT_KEYS),

  // ─── Site identity ────────────────────────
  siteName: isString(200),
  siteNameEn: isString(200),
  description: isString(1000),
  descriptionEn: isString(1000),
  logo: isString(500),

  // ─── Contact ──────────────────────────────
  contactTitle: isString(200),
  contactTitleEn: isString(200),
  contactDescription: isString(1000),
  contactDescriptionEn: isString(1000),
  phone: isString(40),
  email: isEmail,
  address: isString(500),
  addressEn: isString(500),
  workingHours: isString(200),
  workingHoursEn: isString(200),
  contactCtaPrimary: isString(100),
  contactCtaPrimaryEn: isString(100),
  contactCtaSecondary: isString(100),
  contactCtaSecondaryEn: isString(100),

  // ─── Social ───────────────────────────────
  whatsapp: isSafeUrlOrHandle,
  telegram: isSafeUrlOrHandle,
  instagram: isSafeUrlOrHandle,
  mapUrl: isUrl,

  // ─── Channel visibility ───────────────────
  showPhone: isBoolean,
  showEmail: isBoolean,
  showWhatsapp: isBoolean,
  showTelegram: isBoolean,
  showInstagram: isBoolean,
  showMap: isBoolean,
};

/**
 * Keys exposed through the public API.
 *
 * Deliberately an allow-list, not a deny-list: a new CMS-only key added later
 * is private by default and cannot leak by omission.
 */
export const PUBLIC_SETTING_KEYS = new Set<string>([
  'websiteTheme',
  'typographyPreset',
  'fontFaHeading',
  'fontFaBody',
  'fontEnHeading',
  'fontEnBody',
  'siteName',
  'siteNameEn',
  'description',
  'descriptionEn',
  'logo',
  'contactTitle',
  'contactTitleEn',
  'contactDescription',
  'contactDescriptionEn',
  'phone',
  'email',
  'address',
  'addressEn',
  'workingHours',
  'workingHoursEn',
  'contactCtaPrimary',
  'contactCtaPrimaryEn',
  'contactCtaSecondary',
  'contactCtaSecondaryEn',
  'whatsapp',
  'telegram',
  'instagram',
  'mapUrl',
  'showPhone',
  'showEmail',
  'showWhatsapp',
  'showTelegram',
  'showInstagram',
  'showMap',
]);

export function isPublicSettingKey(key: string): boolean {
  return PUBLIC_SETTING_KEYS.has(key);
}

/** Bilingual validation messages, surfaced directly in the admin UI. */
export const VALIDATION_MESSAGES: Record<string, { en: string; fa: string }> = {
  unknownKey: {
    en: 'Unknown setting key.',
    fa: 'کلید تنظیمات ناشناخته است.',
  },
  invalidTheme: {
    en: 'Invalid theme. Choose one of the eight available themes.',
    fa: 'قالب نامعتبر است. یکی از هشت قالب موجود را انتخاب کنید.',
  },
  invalidFont: {
    en: 'Invalid font for this language slot.',
    fa: 'فونت انتخابی برای این زبان معتبر نیست.',
  },
  invalidUrl: {
    en: 'Enter a valid http(s) link or username.',
    fa: 'یک لینک معتبر http(s) یا نام کاربری وارد کنید.',
  },
};

export interface SettingValidationError {
  key: string;
  messageEn: string;
  messageFa: string;
}

/**
 * Validate one key/value pair.
 * Returns `null` when valid, or a bilingual error describing the problem.
 *
 * Unknown keys are rejected rather than silently stored, so a typo in the admin
 * UI cannot create a dead setting that the frontend will never read.
 */
export function validateSetting(
  key: string,
  value: unknown,
): SettingValidationError | null {
  const validator = SETTING_VALIDATORS[key];

  if (!validator) {
    return {
      key,
      messageEn: VALIDATION_MESSAGES.unknownKey.en,
      messageFa: VALIDATION_MESSAGES.unknownKey.fa,
    };
  }

  const problem = validator(value);
  if (!problem) return null;

  // Prefer a specific localized message where we have one.
  if (key === 'websiteTheme') {
    return {
      key,
      messageEn: VALIDATION_MESSAGES.invalidTheme.en,
      messageFa: VALIDATION_MESSAGES.invalidTheme.fa,
    };
  }

  if (key.startsWith('font')) {
    return {
      key,
      messageEn: VALIDATION_MESSAGES.invalidFont.en,
      messageFa: VALIDATION_MESSAGES.invalidFont.fa,
    };
  }

  if (key === 'whatsapp' || key === 'telegram' || key === 'instagram' || key === 'mapUrl') {
    return {
      key,
      messageEn: VALIDATION_MESSAGES.invalidUrl.en,
      messageFa: VALIDATION_MESSAGES.invalidUrl.fa,
    };
  }

  return {
    key,
    messageEn: `"${key}" ${problem}.`,
    messageFa: `مقدار «${key}» نامعتبر است.`,
  };
}

/** Which settings group a key belongs to (used for admin grouping). */
export function groupForKey(key: string): string {
  if (
    key === 'websiteTheme' ||
    key === 'typographyPreset' ||
    key.startsWith('font')
  ) {
    return 'appearance';
  }
  if (
    key.startsWith('contact') ||
    key.startsWith('show') ||
    ['phone', 'email', 'address', 'addressEn', 'workingHours', 'workingHoursEn',
     'whatsapp', 'telegram', 'instagram', 'mapUrl'].includes(key)
  ) {
    return 'contact';
  }
  return 'general';
}
