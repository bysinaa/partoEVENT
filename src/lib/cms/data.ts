/**
 * Custom CMS Data Access Layer
 * Uses the self-hosted Parto CMS API as the website content source.
 */

import type { Locale } from "@/i18n/routing";

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
  clientNameEn: string | null;
  clientNameFa: string | null;
  projectClients?: { client: Client }[];
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
  photo?: Media;
}

interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  type: string;
  size: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  altTextFa: string | null;
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
function getLocalizedField(
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
function getLocalizedOptional(
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
async function fetchCMS<T>(endpoint: string): Promise<T | null> {
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
  siteNameEn: string;
  tagline: string;
  taglineEn: string;
  description: string;
  descriptionEn: string;
  logo: string | null;
  favicon: string | null;
  email: string;
  phone: string;
  address: string;
  addressEn: string;
  socialLinks: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

export async function getSettings(locale: Locale): Promise<Settings | null> {
  void locale;
  const settings = await fetchCMS<CMSRecord>("/settings");
  if (!settings) return null;

  return {
    siteName: asString(settings.siteName) || "پرتو",
    siteNameEn: asString(settings.siteNameEn) || "Parto",
    tagline: asString(settings.tagline),
    taglineEn: asString(settings.taglineEn),
    description: asString(settings.description),
    descriptionEn: asString(settings.descriptionEn),
    logo: asOptionalString(settings.logo),
    favicon: asOptionalString(settings.favicon),
    email: asString(settings.email),
    phone: asString(settings.phone),
    address: asString(settings.address),
    addressEn: asString(settings.addressEn),
    socialLinks: {
      instagram: asOptionalString(settings.instagram) || undefined,
      linkedin: asOptionalString(settings.linkedin) || undefined,
      twitter: asOptionalString(settings.twitter) || undefined,
      facebook: asOptionalString(settings.facebook) || undefined,
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
    name: getLocalizedField(c, "name", locale) || c.name,
    englishName: c.englishName,
    description: getLocalizedOptional(c, "description", locale),
    logoId: c.logoId,
    coverImageId: c.coverImageId,
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
    name: getLocalizedField(client, "name", locale) || client.name,
    englishName: client.englishName,
    description: getLocalizedOptional(client, "description", locale),
    logoId: client.logoId,
    coverImageId: client.coverImageId,
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
  isFeatured: boolean;
  year: number | null;
  location: string | null;
  clientName: string | null;
  clients: CMSClient[];
}

export async function getFeaturedProjects(locale: Locale): Promise<CMSProject[]> {
  const data = await fetchCMS<{ items: Project[] }>("/projects?featured=true&limit=10");
  if (!data?.items) return [];

  return data.items.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: getLocalizedField(p, "title", locale),
    description: getLocalizedOptional(p, "description", locale),
    thumbnailId: p.thumbnailId,
    coverImageId: p.coverImageId,
    isFeatured: p.isFeatured,
    year: p.year,
    location: getLocalizedOptional(p, "location", locale),
    clientName: getLocalizedOptional(p, "clientName", locale),
    clients: (p.projectClients || []).map((pc) => ({
      id: pc.client.id,
      slug: pc.client.slug,
      name: getLocalizedField(pc.client, "name", locale) || pc.client.name,
      englishName: pc.client.englishName,
      description: getLocalizedOptional(pc.client, "description", locale),
      logoId: pc.client.logoId,
      coverImageId: pc.client.coverImageId,
      website: pc.client.website,
      location: getLocalizedOptional(pc.client, "location", locale),
      featured: pc.client.featured,
      displayOrder: pc.client.displayOrder,
      services: [],
    })),
  }));
}

export async function getProjects(locale: Locale): Promise<CMSProject[]> {
  const data = await fetchCMS<{ items: Project[] }>("/projects?limit=100");
  if (!data?.items) return [];

  return data.items.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: getLocalizedField(p, "title", locale),
    description: getLocalizedOptional(p, "description", locale),
    thumbnailId: p.thumbnailId,
    coverImageId: p.coverImageId,
    isFeatured: p.isFeatured,
    year: p.year,
    location: getLocalizedOptional(p, "location", locale),
    clientName: getLocalizedOptional(p, "clientName", locale),
    clients: (p.projectClients || []).map((pc) => ({
      id: pc.client.id,
      slug: pc.client.slug,
      name: getLocalizedField(pc.client, "name", locale) || pc.client.name,
      englishName: pc.client.englishName,
      description: getLocalizedOptional(pc.client, "description", locale),
      logoId: pc.client.logoId,
      coverImageId: pc.client.coverImageId,
      website: pc.client.website,
      location: getLocalizedOptional(pc.client, "location", locale),
      featured: pc.client.featured,
      displayOrder: pc.client.displayOrder,
      services: [],
    })),
  }));
}

export async function getProjectBySlug(
  locale: Locale,
  slug: string
): Promise<CMSProject | null> {
  const project = await fetchCMS<Project>(`/projects/${slug}`);
  if (!project) return null;

  return {
    id: project.id,
    slug: project.slug,
    title: getLocalizedField(project, "title", locale),
    description: getLocalizedOptional(project, "description", locale),
    thumbnailId: project.thumbnailId,
    coverImageId: project.coverImageId,
    isFeatured: project.isFeatured,
    year: project.year,
    location: getLocalizedOptional(project, "location", locale),
    clientName: getLocalizedOptional(project, "clientName", locale),
    clients: (project.projectClients || []).map((pc) => ({
      id: pc.client.id,
      slug: pc.client.slug,
      name: getLocalizedField(pc.client, "name", locale) || pc.client.name,
      englishName: pc.client.englishName,
      description: getLocalizedOptional(pc.client, "description", locale),
      logoId: pc.client.logoId,
      coverImageId: pc.client.coverImageId,
      website: pc.client.website,
      location: getLocalizedOptional(pc.client, "location", locale),
      featured: pc.client.featured,
      displayOrder: pc.client.displayOrder,
      services: [],
    })),
  };
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
      title: locale === "fa" ? (settings?.siteName || "پرتو") : (settings?.siteNameEn || "Parto"),
      subtitle: locale === "fa" ? (settings?.tagline || "") : (settings?.taglineEn || ""),
    },
    stats,
  };
}