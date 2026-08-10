/**
 * Custom CMS Data Access Layer
 * Uses the self-hosted Parto CMS API as the website content source.
 */

import type { Locale } from "../../i18n/routing";

const CMS_API_URL =
  process.env.CMS_API_URL || "http://localhost:3006/api/v1/api/public";

// Types matching the custom CMS schema
interface Service {
  id: string;
  slug: string;
  titleEn: string;
  titleFa: string | null;
  descriptionEn: string | null;
  descriptionFa: string | null;
  iconId: string | null;
  coverImageId: string | null;
  order: number;
  status: string;
}

interface Client {
  id: string;
  slug: string;
  name: string;
  englishName: string | null;
  descriptionEn: string | null;
  descriptionFa: string | null;
  logoId: string | null;
  coverImageId: string | null;
  website: string | null;
  locationEn: string | null;
  locationFa: string | null;
  featured: boolean;
  displayOrder: number;
  status: string;
  clientServices?: { service: Service }[];
  logo?: CMSMedia | null;
  coverImage?: CMSMedia | null;
}

interface Project {
  id: string;
  slug: string;
  titleEn: string;
  titleFa: string | null;
  descriptionEn: string | null;
  descriptionFa: string | null;
  thumbnailId: string | null;
  coverImageId: string | null;
  isFeatured: boolean;
  status: string;
  year: number | null;
  locationEn: string | null;
  locationFa: string | null;
  clients?: Client[];
  thumbnail?: CMSMedia | null;
  coverImage?: CMSMedia | null;
}

interface TeamMember {
  id: string;
  nameEn: string;
  nameFa: string | null;
  positionEn: string | null;
  positionFa: string | null;
  email: string | null;
  phone: string | null;
  biographyEn: string | null;
  biographyFa: string | null;
  photoId: string | null;
  instagram: string | null;
  linkedin: string | null;
  twitter: string | null;
  order: number;
  isActive: boolean;
  photo?: CMSMedia | null;
}

export interface CMSMedia {
  id: string;
  filename: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  altText: string | null;
  altTextFa: string | null;
  url: string;
}

interface Stats {
  clients: number;
  projects: number;
  teamMembers: number;
  posts: number;
}

type CMSRecord = Record<string, unknown>;

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asOptionalString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

// Helper to get localized field from an object with En/Fa variants
export function getLocalizedField(
  item: object,
  fieldName: string,
  locale: Locale
): string {
  const record = item as CMSRecord;
  const faField = `${fieldName}Fa`;
  const enField = `${fieldName}En`;

  if (locale === "fa") {
    const faValue = asString(record[faField]);
    if (faValue) return faValue;
  }

  return asString(record[enField]);
}

// Helper to get localized optional field
export function getLocalizedOptional(
  item: object,
  fieldName: string,
  locale: Locale
): string | null {
  const record = item as CMSRecord;
  const faField = `${fieldName}Fa`;
  const enField = `${fieldName}En`;

  if (locale === "fa") {
    const faValue = asOptionalString(record[faField]);
    if (faValue) return faValue;
  }

  return asOptionalString(record[enField]);
}

export function getClientName(client: Pick<Client, "name" | "englishName">, locale: Locale): string {
  return locale === "fa" ? client.name : client.englishName || client.name;
}

/**
 * Fetch wrapper with error handling.
 *
 * Every public read goes through here, so this is the single place that decides
 * the caching policy for CMS content.
 *
 * `cache: "no-store"` is deliberate: content edited and published in the admin
 * panel must appear on the website after a plain browser refresh, with no
 * restart and no waiting for a revalidation window. It also opts the calling
 * route out of static generation, so listing pages, detail pages, `generateMetadata`
 * and every locale all read fresh data.
 *
 * If this site ever needs CDN/ISR caching, this is the only function to change:
 * swap in `next: { revalidate: N, tags: [...] }` and invalidate with
 * `revalidateTag` from a publish webhook.
 */
export async function fetchCMS<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${CMS_API_URL}${endpoint}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`CMS API warning: ${res.status} for ${endpoint}`);

      }
      return null;
    }
    return res.json();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`CMS fetch warning for ${endpoint}:`, error);
    }
    return null;
  }
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface Settings {
  siteName: string;
  tagline: string;
  description: string;
  logo: string | null;
  email: string;
  phone: string;
  address: string;
  socialLinks: {
    instagram?: string;
  };
}

export async function getSettings(locale: Locale): Promise<Settings | null> {
  const settings = await fetchCMS<CMSRecord>("/settings");
  if (!settings) return null;

  return mapSettings(settings, locale);
}

export function mapSettings(settings: CMSRecord, locale: Locale): Settings {
  const localized = (key: string) =>
    locale === "en"
      ? asString(settings[`${key}En`]) || asString(settings[key])
      : asString(settings[key]);

  return {
    siteName: localized("siteName") || (locale === "fa" ? "پرتو" : "Parto"),
    tagline: localized("tagline"),
    description: localized("description"),
    logo: asOptionalString(settings.logo),
    email: asString(settings.email),
    phone: asString(settings.phone),
    address: localized("address"),
    socialLinks: {
      instagram: asOptionalString(settings.instagram) || undefined,
    },
  };
}

// ─── Services ───────────────────────────────────────────────────────────────

export interface CMSService {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  iconId: string | null;
  coverImageId: string | null;
  order: number;
}

export async function getServices(locale: Locale): Promise<CMSService[]> {
  const data = await fetchCMS<{ items: Service[] }>("/services?limit=100");
  if (!data?.items) return [];

  return data.items.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: getLocalizedField(s, "title", locale),
    description: getLocalizedOptional(s, "description", locale),
    iconId: s.iconId,
    coverImageId: s.coverImageId,
    order: s.order,
  }));
}

// ─── Clients ─────────────────────────────────────────────────────────────────

export interface CMSClient {
  id: string;
  slug: string;
  name: string;
  englishName: string | null;
  description: string | null;
  logoId: string | null;
  coverImageId: string | null;
  logo: CMSMedia | null;
  coverImage: CMSMedia | null;
  website: string | null;
  location: string | null;
  featured: boolean;
  displayOrder: number;
  services: CMSService[];
}

export async function getClients(locale: Locale): Promise<CMSClient[]> {
  const data = await fetchCMS<{ items: Client[] }>("/clients?limit=100");
  if (!data?.items) return [];

  return data.items.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: getClientName(c, locale),
    englishName: c.englishName,
    description: getLocalizedOptional(c, "description", locale),
    logoId: c.logoId,
    coverImageId: c.coverImageId,
    logo: c.logo ?? null,
    coverImage: c.coverImage ?? null,
    website: c.website,
    location: getLocalizedOptional(c, "location", locale),
    featured: c.featured,
    displayOrder: c.displayOrder,
    services: (c.clientServices || []).map((cs) => ({
      id: cs.service.id,
      slug: cs.service.slug,
      title: getLocalizedField(cs.service, "title", locale),
      description: getLocalizedOptional(cs.service, "description", locale),
      iconId: cs.service.iconId,
      coverImageId: cs.service.coverImageId,
      order: cs.service.order,
    })),
  }));
}

export async function getClientBySlug(
  locale: Locale,
  slug: string
): Promise<CMSClient | null> {
  const client = await fetchCMS<Client>(`/clients/${slug}`);
  if (!client) return null;

  return {
    id: client.id,
    slug: client.slug,
    name: getClientName(client, locale),
    englishName: client.englishName,
    description: getLocalizedOptional(client, "description", locale),
    logoId: client.logoId,
    coverImageId: client.coverImageId,
    logo: client.logo ?? null,
    coverImage: client.coverImage ?? null,
    website: client.website,
    location: getLocalizedOptional(client, "location", locale),
    featured: client.featured,
    displayOrder: client.displayOrder,
    services: (client.clientServices || []).map((cs) => ({
      id: cs.service.id,
      slug: cs.service.slug,
      title: getLocalizedField(cs.service, "title", locale),
      description: getLocalizedOptional(cs.service, "description", locale),
      iconId: cs.service.iconId,
      coverImageId: cs.service.coverImageId,
      order: cs.service.order,
    })),
  };
}

// ─── Projects ────────────────────────────────────────────────────────────────

export interface CMSProject {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  thumbnailId: string | null;
  coverImageId: string | null;
  thumbnail: CMSMedia | null;
  coverImage: CMSMedia | null;
  isFeatured: boolean;
  year: number | null;
  location: string | null;
  clients: CMSClient[];
}

export function mapProject(project: Project, locale: Locale): CMSProject {
  return {
    id: project.id,
    slug: project.slug,
    title: getLocalizedField(project, "title", locale),
    description: getLocalizedOptional(project, "description", locale),
    thumbnailId: project.thumbnailId,
    coverImageId: project.coverImageId,
    thumbnail: project.thumbnail ?? null,
    coverImage: project.coverImage ?? null,
    isFeatured: project.isFeatured,
    year: project.year,
    location: getLocalizedOptional(project, "location", locale),
    clients: (project.clients || []).map((client) => ({
      id: client.id,
      slug: client.slug,
      name: getClientName(client, locale),
      englishName: client.englishName,
      description: getLocalizedOptional(client, "description", locale),
      logoId: client.logoId,
      coverImageId: client.coverImageId,
      logo: client.logo ?? null,
      coverImage: client.coverImage ?? null,
      website: client.website,
      location: getLocalizedOptional(client, "location", locale),
      featured: client.featured,
      displayOrder: client.displayOrder,
      services: [],
    })),
  };
}

export async function getFeaturedProjects(locale: Locale): Promise<CMSProject[]> {
  const data = await fetchCMS<{ items: Project[] }>("/projects?isFeatured=true&limit=10");
  if (!data?.items) return [];

  return data.items.map((project) => mapProject(project, locale));
}

export async function getProjects(locale: Locale): Promise<CMSProject[]> {
  const data = await fetchCMS<{ items: Project[] }>("/projects?limit=100");
  if (!data?.items) return [];

  return data.items.map((project) => mapProject(project, locale));
}

export async function getProjectBySlug(
  locale: Locale,
  slug: string
): Promise<CMSProject | null> {
  const project = await fetchCMS<Project>(`/projects/${slug}`);
  if (!project) return null;

  return mapProject(project, locale);
}

// ─── Team Members ─────────────────────────────────────────────────────────────

export interface CMSTeamMember {
  id: string;
  name: string;
  position: string | null;
  email: string | null;
  phone: string | null;
  biography: string | null;
  photoId: string | null;
  photo: CMSMedia | null;
  instagram: string | null;
  linkedin: string | null;
  twitter: string | null;
  order: number;
}

export async function getTeamMembers(locale: Locale): Promise<CMSTeamMember[]> {
  const data = await fetchCMS<{ items: TeamMember[] }>("/team?limit=100");
  if (!data?.items) return [];

  return data.items.map((m) => ({
    id: m.id,
    name: getLocalizedField(m, "name", locale),
    position: getLocalizedOptional(m, "position", locale),
    email: m.email,
    phone: m.phone,
    biography: getLocalizedOptional(m, "biography", locale),
    photoId: m.photoId,
    photo: m.photo ?? null,
    instagram: m.instagram,
    linkedin: m.linkedin,
    twitter: m.twitter,
    order: m.order,
  }));
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export interface CMSStats {
  clients: number;
  projects: number;
  teamMembers: number;
  posts: number;
}

export async function getStats(): Promise<CMSStats | null> {
  return fetchCMS<Stats>("/stats");
}

// ─── Home Page Data ───────────────────────────────────────────────────────────

export interface HomePageData {
  hero: {
    title: string;
    subtitle: string;
  };
  stats: CMSStats | null;
}

export async function getHomePageData(locale: Locale): Promise<HomePageData> {
  const settings = await getSettings(locale);
  const stats = await getStats();

  return {
    hero: {
      title: settings?.siteName || (locale === "fa" ? "پرتو" : "Parto"),
      subtitle: settings?.tagline || "",
    },
    stats,
  };
}
