/**
 * Parto — Global appearance + contact settings.
 *
 * One canonical source: the CMS `site_settings` table, exposed through
 * `GET /api/public/settings`. Nothing here is hardcoded per-environment and
 * nothing is duplicated across records — the frontend only *reads* and
 * *sanitizes*.
 *
 * Because `fetchSettings` uses `cache: "no-store"` (see `data.ts`), changing the
 * theme in CMS and reloading the browser is enough to repaint the whole site.
 * No rebuild, no redeploy, no revalidation window.
 */

// Relative, extension-qualified imports (not the `@/` alias) so this module is
// directly loadable by the `node:test` runner, which resolves neither tsconfig
// path mappings nor extensionless specifiers. The bundler resolves them the same.
import type { Locale } from "../../i18n/routing.ts";
import { resolveTheme, type ThemeDefinition } from "../theme/themes.ts";
import { resolveTypography, type ResolvedTypography } from "../theme/typography.ts";

const CMS_API_URL =
  process.env.CMS_API_URL || "http://localhost:3006/api/v1/api/public";

type Raw = Record<string, unknown>;

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function bool(value: unknown, fallback = true): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

/** Pick the locale-appropriate value from a `key` / `keyEn` pair. */
function localized(raw: Raw, key: string, locale: Locale): string {
  // Persian is the primary/base field; English is suffixed with `En`.
  return locale === "fa" ? str(raw[key]) : str(raw[`${key}En`]) || str(raw[key]);
}

async function fetchSettings(): Promise<Raw | null> {
  try {
    const res = await fetch(`${CMS_API_URL}/settings`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Raw;
  } catch {
    // A CMS outage must never take the website down — callers fall back to defaults.
    return null;
  }
}

// ─── Appearance ──────────────────────────────────────────────────────────────

export interface Appearance {
  theme: ThemeDefinition;
  typography: ResolvedTypography;
}

/**
 * Resolve the active site appearance.
 *
 * Every step degrades safely: unreachable CMS → null settings → invalid theme id
 * → `FALLBACK_THEME_ID`. The site always renders with a valid, accessible theme.
 */
export function resolveAppearance(settings: Raw | null): Appearance {
  const theme = resolveTheme(settings?.websiteTheme);

  // A theme carries a default typography personality; CMS may override any slot.
  const typography = resolveTypography(
    settings?.typographyPreset ?? theme.typography,
    {
      faHeading: settings?.fontFaHeading,
      faBody: settings?.fontFaBody,
      enHeading: settings?.fontEnHeading,
      enBody: settings?.fontEnBody,
    }
  );

  return { theme, typography };
}

export async function getAppearance(): Promise<Appearance> {
  return resolveAppearance(await fetchSettings());
}

// ─── Contact + social ────────────────────────────────────────────────────────

export interface ContactChannel {
  /** Stable id used for icon lookup and testing. */
  id: "phone" | "email" | "whatsapp" | "telegram" | "instagram" | "map";
  /** Ready-to-use href. Always absolute/valid or the channel is omitted. */
  href: string;
  /** Human-readable value (phone number, @handle, address…). */
  label: string;
  /** Whether the link leaves the site (drives target/rel). */
  external: boolean;
}

export interface ContactSettings {
  title: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  ctaPrimary: string;
  ctaSecondary: string;
  channels: ContactChannel[];
}

/** Keep only http(s) URLs — blocks `javascript:` and other hostile schemes. */
function safeUrl(value: string): string {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

/** Digits only, preserving a leading `+`. */
function normalizePhone(value: string): string {
  const trimmed = value.replace(/[^\d+]/g, "");
  return trimmed.startsWith("+") ? `+${trimmed.slice(1).replace(/\+/g, "")}` : trimmed;
}

/**
 * Guard against stripping a non-phone string down to a stray digit.
 *
 * Without this, a pasted value like `javascript:alert(1)` reduces to "1" and
 * would be published as `tel:1` / `https://wa.me/1`. Seven digits is the
 * shortest realistic national subscriber number.
 */
function isDialable(phone: string): boolean {
  return phone.replace(/\D/g, "").length >= 7;
}

/**
 * Accept a full URL, an @handle or a bare username and produce a valid profile URL.
 * Returns "" when nothing usable was supplied, so the channel is hidden.
 */
function normalizeHandle(value: string, baseUrl: string): string {
  if (!value) return "";

  if (/^https?:\/\//i.test(value)) return safeUrl(value);

  const handle = value.replace(/^@/, "").replace(/^\/+/, "").trim();
  if (!handle || !/^[A-Za-z0-9._-]+$/.test(handle)) return "";

  return `${baseUrl}/${handle}`;
}

/** WhatsApp accepts either a wa.me link or a phone number. */
function normalizeWhatsApp(value: string): { href: string; label: string } {
  if (!value) return { href: "", label: "" };

  if (/^https?:\/\//i.test(value)) {
    const href = safeUrl(value);
    return { href, label: href ? "WhatsApp" : "" };
  }

  const phone = normalizePhone(value).replace(/^\+/, "");
  if (!isDialable(phone)) return { href: "", label: "" };

  return { href: `https://wa.me/${phone}`, label: `+${phone}` };
}

export function resolveContact(
  settings: Raw | null,
  locale: Locale
): ContactSettings {
  const raw: Raw = settings ?? {};

  const phone = normalizePhone(str(raw.phone));
  const email = str(raw.email);
  const address = localized(raw, "address", locale);

  const whatsapp = normalizeWhatsApp(str(raw.whatsapp));
  const telegram = normalizeHandle(str(raw.telegram), "https://t.me");
  const instagram = normalizeHandle(str(raw.instagram), "https://instagram.com");
  const mapUrl = safeUrl(str(raw.mapUrl));

  const channels: ContactChannel[] = [];

  // Each channel is included only when it has a usable value *and* is enabled.
  if (isDialable(phone) && bool(raw.showPhone)) {
    channels.push({ id: "phone", href: `tel:${phone}`, label: phone, external: false });
  }

  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && bool(raw.showEmail)) {
    channels.push({ id: "email", href: `mailto:${email}`, label: email, external: false });
  }

  if (whatsapp.href && bool(raw.showWhatsapp)) {
    channels.push({
      id: "whatsapp",
      href: whatsapp.href,
      label: whatsapp.label,
      external: true,
    });
  }

  if (telegram && bool(raw.showTelegram)) {
    channels.push({ id: "telegram", href: telegram, label: "Telegram", external: true });
  }

  if (instagram && bool(raw.showInstagram)) {
    channels.push({
      id: "instagram",
      href: instagram,
      label: "Instagram",
      external: true,
    });
  }

  if (mapUrl && bool(raw.showMap)) {
    channels.push({ id: "map", href: mapUrl, label: address || "Map", external: true });
  }

  return {
    title: localized(raw, "contactTitle", locale),
    description: localized(raw, "contactDescription", locale),
    phone,
    email,
    address,
    workingHours: localized(raw, "workingHours", locale),
    ctaPrimary: localized(raw, "contactCtaPrimary", locale),
    ctaSecondary: localized(raw, "contactCtaSecondary", locale),
    channels,
  };
}

export async function getContact(locale: Locale): Promise<ContactSettings> {
  return resolveContact(await fetchSettings(), locale);
}

/**
 * Fetch appearance and contact in a single request.
 * Used by the layout so a page render costs one settings round-trip, not three.
 */
export async function getGlobalSettings(locale: Locale): Promise<{
  appearance: Appearance;
  contact: ContactSettings;
}> {
  const settings = await fetchSettings();
  return {
    appearance: resolveAppearance(settings),
    contact: resolveContact(settings, locale),
  };
}
