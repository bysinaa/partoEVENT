// ============================================
// Single source of truth for media URL resolution (Admin)
// ============================================
//
// The CMS stores a Media *id* (cuid) on entity fields such as `logoId`,
// `thumbnailId`, `coverImageId` and `photoId`. The file on disk is named
// `<uuid>.<ext>`, which is unrelated to that id. Building a URL by pasting an
// id onto `/uploads/` therefore always 404s — that was the cause of every
// broken image in the admin panel.
//
// Resolution rules:
//   - absolute URL  -> use as-is
//   - `/uploads/...` -> prefix with the API origin
//   - bare cuid      -> look the record up via `/media/:id` and use its `url`
//
// Everything that needs a media URL must go through this module so the logic
// exists in exactly one place.

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3006";

/** Base URL including the `/api/v1` prefix, e.g. http://localhost:3006/api/v1 */
export const API_BASE = `${RAW_API_URL.replace(/\/+$/, "").replace(/\/api\/v1$/, "")}/api/v1`;

/** Bare origin with no path, e.g. http://localhost:3006 — static files live here. */
export const API_ORIGIN = API_BASE.replace(/\/api\/v1$/, "");

/** cuid values produced by Prisma's `@default(cuid())`. */
const CUID_RE = /^c[a-z0-9]{20,}$/i;

export function isMediaId(value?: string | null): boolean {
  return !!value && CUID_RE.test(value);
}

/**
 * Resolve a value that is already a URL or path. Returns '' for a bare media
 * id, which must be resolved asynchronously via `fetchMediaUrl`.
 */
export function resolveMediaUrl(value?: string | null): string {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  // `/api/v1/uploads/x` -> `/uploads/x`; static assets are not behind the prefix.
  if (value.startsWith("/api/v1/")) return `${API_ORIGIN}${value.replace(/^\/api\/v1/, "")}`;
  if (value.startsWith("/")) return `${API_ORIGIN}${value}`;
  // A cuid is an id, not a filename — it cannot be turned into a URL here.
  if (isMediaId(value)) return "";
  return `${API_ORIGIN}/uploads/${value}`;
}

const urlCache = new Map<string, string>();

/**
 * Resolve a media id to a served URL, caching the lookup. Values that are
 * already URLs or paths short-circuit without a network call.
 */
export async function fetchMediaUrl(value?: string | null): Promise<string> {
  if (!value) return "";

  const direct = resolveMediaUrl(value);
  if (direct) return direct;

  const cached = urlCache.get(value);
  if (cached !== undefined) return cached;

  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const res = await fetch(`${API_BASE}/media/${value}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      urlCache.set(value, "");
      return "";
    }
    const media = await res.json();
    const url = resolveMediaUrl(media.url || media.path || media.filename);
    urlCache.set(value, url);
    return url;
  } catch {
    urlCache.set(value, "");
    return "";
  }
}

/** Drop a cache entry, e.g. after the underlying media is replaced or deleted. */
export function invalidateMediaUrl(value?: string | null): void {
  if (value) urlCache.delete(value);
}
