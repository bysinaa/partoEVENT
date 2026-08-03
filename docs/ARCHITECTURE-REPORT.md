# Parto CMS — Complete Architecture Analysis & New CMS Design

**Date:** July 6, 2026  
**Author:** Principal Software Architect  
**Scope:** Reverse engineering of the former Sanity-based CMS → Design of the custom CMS

---

> ## ⚠️ Historical Document
>
> This report was written **before** the migration, to justify and design the move off Sanity.
> It is kept as a design/decision record — **it does not describe the current system.**
>
> Sanity has since been fully removed: no `sanity.config.ts`, no `/studio` route, no
> `src/sanity/` or `src/lib/sanity/`, no `SANITY_*` environment variables, and no Sanity
> packages in any `package.json`. The website now reads from the self-hosted Parto CMS
> (NestJS + Prisma + PostgreSQL) in `parto-cms/`, via `src/lib/cms/data.ts`.
>
> **Every "Sanity" reference below refers to the retired system.** Part 1 is the
> as-was analysis; Part 2 onward is the design that was implemented.
> For current setup and usage, see [`README.md`](../README.md).

---


## PART 1: REVERSE ENGINEERING — EXISTING CMS ANALYSIS

### 1.1 Project Overview

The existing system is a **Next.js 16 + Sanity CMS** website for **Parto Event Group**, a company operating in event production, professional lighting, LED displays, projection mapping, AV systems, and stage technology based in Iran.

**Tech Stack:**
- **Frontend:** Next.js 16.2.9, React 19.2.4, Tailwind CSS 4, Framer Motion
- **CMS:** Sanity v3 (embedded Studio at `/studio`)
- **Localization:** next-intl 4.13 (Persian `fa` default, English `en`)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + custom CSS variables (no component library)
- **Compiler:** React Compiler (babel-plugin-react-compiler)

### 1.2 Folder Structure Analysis

```
parto/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/           # i18n routes
│   │   │   ├── page.tsx        # Homepage (sections-driven)
│   │   │   ├── layout.tsx      # Root locale layout
│   │   │   ├── not-found.tsx   # 404 page
│   │   │   ├── team/page.tsx   # Team listing
│   │   │   └── clients/[slug]/page.tsx  # Client detail
│   │   └── studio/[[...index]]/  # Embedded Sanity Studio
│   ├── components/             # Flat component directory (12 files)
│   ├── hooks/                  # Empty
│   ├── i18n/                   # next-intl routing config
│   ├── lib/sanity/             # Sanity client, fetch, image, types
│   ├── messages/               # i18n message files (en.json, fa.json)
│   ├── sanity/                 # Sanity Studio config, schemas, queries
│   │   ├── schemas/
│   │   │   ├── documents/      # 6 document types
│   │   │   └── objects/        # 7 object types
│   │   └── queries/            # GROQ queries (7 files)
│   └── styles/                 # Empty directory
├── public/                     # Static assets
├── sanity.config.ts            # Top-level Sanity config (redundant?)
└── middleware.ts               # next-intl middleware
```

### 1.3 Content Model (Sanity Schemas)

#### Document Types (6):
| Document | Purpose | Key Fields |
|----------|---------|------------|
| `project` | Case studies/portfolio items | title (localized), slug, client (ref), category (ref), thumbnail, gallery, videos, description (PT), eventDate, services (ref[]), featured, seo |
| `client` | Corporate clients | name, englishName, slug, logo, coverImage, gallery, videos, description (PT), services (ref[]), website, location (localized), featured, displayOrder, seo |
| `service` | Services offered | title (localized), slug, description (localized), icon, coverImage, order, seo |
| `teamMember` | Team members | name (localized), position (localized), photo, biography (PT), instagram, linkedin, order |
| `category` | Project categories | title (localized), slug, description (localized), order |
| `settings` | Global site settings (singleton) | companyName (localized), phone, whatsapp, telegram, instagram, email, address (localized), googleMapsUrl, workingHours (localized), footerText (localized), seoDefaults, social, logo |
| `homePage` | Homepage config (singleton) | hero fields, sections (array of homeSection), stats, seo |

#### Object Types (7):
| Object | Purpose |
|--------|---------|
| `localizedString` | `{fa, en}` string wrapper |
| `localizedText` | `{fa, en}` text wrapper |
| `localizedPortableText` | `{fa, en}` rich text wrapper |
| `video` | External URL or uploaded file |
| `seo` | `{title, description, ogImage}` |
| `socialLinks` | Instagram, LinkedIn, Telegram, WhatsApp, YouTube, Aparat |
| `stat` | `{value, label}` for homepage stats |
| `homeSection` | `{section, enabled}` for homepage section ordering |

### 1.4 Routing & Pages

| Route | Component | Data |
|-------|-----------|------|
| `/` → redirects to `/fa` | — | redirect |
| `/[locale]` | `page.tsx` (HomePage) | All homepage data in parallel |
| `/[locale]/team` | `team/page.tsx` | Team members |
| `/[locale]/clients/[slug]` | `clients/[slug]/page.tsx` | Client by slug |
| `/studio/[[...index]]` | Sanity Studio | — |

### 1.5 Data Flow

```
Sanity Cloud → sanityClient (server) → sanityFetch (cached) → data.ts (typed wrappers) → Page Components
```

- **Server-side only** — No client-side data fetching
- **ISR with 60s revalidation** in production
- **Graceful degradation** — Returns `null` on error, never crashes
- **Type-safe** — sanity-typegen generates types from GROQ queries
- **Locale-aware** — `$lang` parameter resolved at call site

### 1.6 Localization Strategy

- **Dual-language inline** — All localized fields store `{fa, en}` in a single document
- **GROQ `coalesce()`** — `coalesce(field[$lang], field.fa)` with Persian fallback
- **URL prefix** — `/fa/...` and `/en/...`
- **RTL support** — `dir="rtl"` for Persian, `dir="ltr"` for English
- **Middleware-based** — next-intl handles routing, locale detection

### 1.7 SEO Handling

- **Per-document SEO** — `seo` object on projects, clients, services, settings
- **Fallback chain** — Page SEO → Settings SEO defaults → Message keys
- **OG images** — Per-document with Sanity image pipeline
- **Dynamic metadata** — `generateMetadata()` in layout

### 1.8 Media Handling

- **Sanity Assets** — Images and files stored in Sanity's asset pipeline
- **Image CDN** — `cdn.sanity.io` with auto-format and fit-max
- **next/image** — Whitelisted for Sanity CDN
- **Hotspot** — Enabled on most images for focal point
- **Videos** — Either external URLs (YouTube/Vimeo/Aparat) or file uploads

### 1.9 Studio Configuration

- **Embedded** at `/studio` route
- **Custom structure** — Emoji-prefixed, business-grouped sidebar
- **Singletons** — Home Page and Settings pinned to top
- **Templates** — Pre-filled defaults for quick content creation
- **Vision tool** — GROQ playground for debugging

---

## PART 2: STRENGTHS, WEAKNESSES & TECHNICAL DEBT

### 2.1 Strengths ✅

1. **Excellent code organization** — Clean separation: schemas, queries, lib, components
2. **Type-safe end-to-end** — sanity-typegen provides full type safety from schema to component
3. **Graceful degradation** — Fetch wrapper never crashes, returns null
4. **Well-documented** — Every file has thorough JSDoc comments
5. **Smart localization** — Inline dual-language avoids document proliferation
6. **Homepage flexibility** — Section ordering is content-controlled via Studio
7. **Premium CSS design system** — Well-crafted CSS variables, glow effects, card system
8. **ISR caching** — 60s revalidation with on-demand capability
9. **Minimal dependencies** — Lean dependency tree
10. **React Compiler enabled** — Future-proof rendering optimization

### 2.2 Weaknesses ❌

1. **NO AUTHENTICATION** — Sanity Studio is open to anyone who knows the URL. No login, no access control
2. **NO ROLE MANAGEMENT** — No distinction between admin, editor, viewer
3. **NO DRAFT/PREVIEW WORKFLOW** — Client reads `published` perspective only
4. **NO REVISION HISTORY** — No way to track or revert changes
5. **NO AUDIT LOG** — No record of who changed what and when
6. **NO SEARCH/FILTERING** — Sanity Studio's built-in only, no custom search
7. **NO BULK OPERATIONS** — No batch editing or deletion
8. **NO ACTIVITY LOG** — No dashboard showing recent changes
9. **LIMITED PAGES** — Only homepage, team, and client detail exist
10. **NO PAGE BUILDER** — Homepage has sections but no true drag-and-drop page building
11. **NO BLOG/NEWS** — No content marketing capability
12. **NO CONTACT FORM** — No way for leads to reach out via the website
13. **NO MEDIA LIBRARY MANAGEMENT** — Relies entirely on Sanity's built-in
14. **NO IMAGE OPTIMIZATION CONTROL** — Limited to Sanity's CDN transforms
15. **NO NAVIGATION BUILDER** — Footer/navbar are hardcoded in components
16. **DEPENDENCY ON SANITY CLOUD** — If Sanity goes down or changes pricing, the whole system is at risk
17. **GROQ IS PROPRIETARY** — Not a standard query language; creates vendor lock-in
18. **NO API FOR EXTERNAL CONSUMERS** — No REST/GraphQL endpoint for mobile apps or integrations
19. **FLAT COMPONENT STRUCTURE** — All 12 components in one directory
20. **NO LOADING STATES** — Server components with no streaming/loading UX
21. **EMPTY HOOKS DIRECTORY** — Abandoned pattern
22. **NO FORM HANDLING** — No form library, no validation library
23. **NO ERROR BOUNDARIES** — No granular error handling per section
24. **MIXED CSS APPROACHES** — Tailwind + custom CSS variables + utility classes

### 2.3 Technical Debt

1. **`asText()` / `asPortableText()` type gymnastics** — Workaround for sanity-typegen's inability to evaluate dynamic GROQ keys. Entire `types.ts` file exists solely to paper over this limitation
2. **`isUnique: () => true`** — Slug uniqueness validation is disabled (always returns true)
3. **Redundant `src/sanity.config.ts` AND `sanity.config.ts`** — Two config files at different levels
4. **Empty directories** — `src/hooks/`, `src/styles/` suggest abandoned plans
5. **Hardcoded social links in `socialLinks.ts`** — Adding a new platform requires code change
6. **No internationalization for Client name** — Client `name` is Persian-only string, not localized
7. **`useCdn = false` explicitly** — Sanity CDN disabled, losing global edge caching
8. **`resultSourceMap: false`** — Source maps disabled, making debugging harder

### 2.4 Missing Features (Compared to Modern CMS)

| Feature | Status | Impact |
|---------|--------|--------|
| Authentication | ❌ Missing | Critical — anyone can edit content |
| RBAC | ❌ Missing | High — no role separation |
| Draft/Preview | ❌ Missing | High — no safe editing workflow |
| Revision History | ❌ Missing | High — no change tracking |
| Page Builder | ❌ Missing | Medium — limited to homepage sections |
| Blog | ❌ Missing | Medium — no content marketing |
| Contact Forms | ❌ Missing | Medium — no lead capture |
| Media Library | ⚠️ Basic | Medium — no management tools |
| Search | ❌ Missing | Medium — no admin search |
| Bulk Actions | ❌ Missing | Medium — tedious for large datasets |
| Activity Log | ❌ Missing | Medium — no accountability |
| Dark Mode (Admin) | ❌ N/A | Low — Sanity has its own UI |
| Multi-language Content | ✅ Inline | Already solved |
| Navigation Builder | ❌ Missing | Medium — hardcoded menus |
| Settings UI | ⚠️ Sanity only | Low — works but no custom UI |
| API for Consumers | ❌ Missing | High — no external integrations |
| Notifications | ❌ Missing | Low — no event notifications |
| Image Optimization | ⚠️ Basic | Medium — limited control |

---

## PART 3: BUSINESS REQUIREMENTS FOR NEW CMS

### 3.1 Business Domain

**Parto Event Group** operates in:
- Event Production & Management
- Professional Lighting Design & Execution
- LED Display Systems (rental & permanent)
- Projection Mapping
- Audio Visual Systems Design & Installation
- Stage Technology & Set Design
- Corporate Events & Conferences
- Concerts & Live Performances
- TV/Broadcast Production
- Product Launches & Exhibitions

### 3.2 Target Users

| Role | Needs |
|------|-------|
| **Super Admin** | Full control, user management, system settings |
| **Admin** | Content management, media, analytics |
| **Editor** | Content editing, media upload, draft/publish |
| **Viewer** | Read-only dashboard access |
| **External (future)** | API consumers, mobile apps |

### 3.3 Content Requirements

#### Core Content Types:
1. **Projects** — Portfolio items with case study depth
2. **Clients** — Corporate client profiles
3. **Services** — Service offerings with descriptions
4. **Team Members** — Staff profiles with bios
5. **Categories** — Project classification
6. **Blog Posts** — Content marketing articles
7. **Gallery** — Standalone media galleries
8. **Testimonials** — Client testimonials/reviews
9. **Awards** — Industry awards and recognitions
10. **Partners** — Technology/service partners
11. **Contact Requests** — Lead capture forms
12. **Site Settings** — Global configuration
13. **Menus/Navigation** — Dynamic menu builder
14. **Pages** — Generic page content
15. **Media Library** — Centralized asset management

#### Business-Specific Content Types:
16. **Equipment** — Equipment inventory (LED panels, lighting rigs, etc.)
17. **Equipment Categories** — Classification of equipment
18. **Case Studies** — Detailed project breakdowns
19. **Videos** — Video portfolio items
20. **FAQs** — Frequently asked questions
21. **Careers** — Job postings
22. **Press/Media** — Press mentions and media coverage

---

## PART 4: NEW CMS DESIGN

### 4.1 CMS Philosophy

**Design Principles:**
1. **Domain-first** — Every feature serves the event production business
2. **Speed is a feature** — Sub-100ms interactions, optimistic updates
3. **Progressive complexity** — Simple by default, powerful when needed
4. **Content-first UI** — Minimal chrome, maximum content visibility
5. **Keyboard-first** — Every action has a keyboard shortcut
6. **Dark by default** — Professional, premium feel

**Design Language:**
- **Inspired by:** Notion (content blocks), Linear (speed + keyboard), Vercel (clean dashboard), Payload CMS (self-hosted control)
- **NOT copied from:** Any single product
- **Visual Identity:** Dark theme with accent colors, subtle glass effects, generous spacing

### 4.2 Technical Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 15+ (App Router) | Server components, streaming, ISR |
| **Backend** | NestJS | Modular, enterprise-grade, DI |
| **ORM** | Prisma | Type-safe, migration-friendly |
| **Database** | PostgreSQL | Relational, JSON support, full-text search |
| **Cache** | Redis | Sessions, rate limiting, query cache |
| **Storage** | MinIO (S3-compatible) | Self-hosted, S3 API compatible |
| **Auth** | JWT + Refresh tokens | Stateless, scalable |
| **API** | REST (OpenAPI spec) | Simple, well-understood, GraphQL-ready |
| **Admin UI** | Next.js + Tailwind + shadcn/ui | Component library, fully customizable |
| **Validation** | Zod | TypeScript-first validation |
| **Rich Text** | TipTap | Extensible, collaborative-ready |

### 4.3 Architecture Pattern

**Clean Architecture (4 Layers):**

```
┌─────────────────────────────────────────────┐
│              PRESENTATION                    │
│  (Next.js pages, NestJS controllers)        │
├─────────────────────────────────────────────┤
│              APPLICATION                     │
│  (Use cases, DTOs, validation)              │
├─────────────────────────────────────────────┤
│                DOMAIN                        │
│  (Entities, value objects, interfaces)       │
├─────────────────────────────────────────────┤
│             INFRASTRUCTURE                   │
│  (Prisma, MinIO, Redis, email, AI)          │
└─────────────────────────────────────────────┘
```

### 4.4 Database Schema Design

#### Core Tables:

```sql
-- Users & Auth
users (id, email, name, password_hash, role, avatar, is_active, last_login, created_at, updated_at)
roles (id, name, description, permissions, is_system, created_at)
refresh_tokens (id, user_id, token, expires_at, created_at)

-- Content
projects (id, slug, client_id, category_id, thumbnail_id, event_date, is_featured, 
          display_order, status, published_at, created_by, created_at, updated_at)
project_translations (id, project_id, locale, title, description_rich, seo_title, seo_description, og_image_id)

clients (id, slug, logo_id, cover_image_id, website, is_featured, display_order, 
         status, created_by, created_at, updated_at)
client_translations (id, client_id, locale, name, english_name, description_rich, 
                     location, seo_title, seo_description, og_image_id)

services (id, slug, icon_id, cover_image_id, display_order, status, created_at, updated_at)
service_translations (id, service_id, locale, title, description, seo_title, seo_description)

team_members (id, slug, photo_id, instagram, linkedin, display_order, status, created_at, updated_at)
team_member_translations (id, team_member_id, locale, name, position, biography_rich)

categories (id, slug, display_order, created_at, updated_at)
category_translations (id, category_id, locale, title, description)

-- Blog
posts (id, slug, author_id, featured_image_id, status, published_at, created_at, updated_at)
post_translations (id, post_id, locale, title, excerpt, content_rich, seo_title, seo_description)

-- Pages (generic)
pages (id, slug, template, featured_image_id, status, published_at, created_at, updated_at)
page_translations (id, page_id, locale, title, content_rich, seo_title, seo_description)
page_blocks (id, page_id, block_type, block_data, position, created_at)

-- Media
media (id, filename, original_name, mime_type, size, width, height, alt_text, 
       folder_id, uploaded_by, created_at)
media_folders (id, name, parent_id, created_at)

-- Navigation
menus (id, slug, name, created_at, updated_at)
menu_items (id, menu_id, parent_id, label, url, page_id, position, is_visible, created_at)
menu_item_translations (id, menu_item_id, locale, label)

-- Settings
settings (id, key, value_json, updated_by, updated_at)
setting_translations (id, setting_id, locale, value_text)

-- Forms
form_submissions (id, form_name, data_json, ip_address, user_agent, status, created_at)

-- Relations (M:N)
project_services (project_id, service_id)
client_services (client_id, service_id)
project_gallery (project_id, media_id, position)
client_gallery (client_id, media_id, position)

-- Audit & Activity
audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, created_at)
activity_log (id, user_id, action, description, entity_type, entity_id, created_at)

-- Localization
languages (id, code, name, native_name, is_default, is_active, created_at)

-- AI
ai_generations (id, user_id, prompt, response, model, entity_type, entity_id, tokens_used, created_at)

-- Revisions
content_revisions (id, entity_type, entity_id, data_snapshot, created_by, created_at)

-- Contact Requests
contact_requests (id, name, email, phone, company, subject, message, status, 
                  assigned_to, created_at, updated_at)

-- Testimonials
testimonials (id, client_id, author_name, author_position, rating, is_featured, 
              display_order, status, created_at, updated_at)
testimonial_translations (id, testimonial_id, locale, content)

-- Awards
awards (id, year, image_id, status, created_at, updated_at)
award_translations (id, award_id, locale, title, organization, description)

-- Partners
partners (id, logo_id, website, display_order, status, created_at, updated_at)
partner_translations (id, partner_id, locale, name, description)

-- Equipment (business-specific)
equipment (id, slug, category_id, image_id, brand, model, specifications_json, 
           is_available_for_rent, daily_rate, status, created_at, updated_at)
equipment_translations (id, equipment_id, locale, name, description)
equipment_categories (id, slug, icon_id, display_order, created_at)
equipment_category_translations (id, equipment_category_id, locale, title, description)

-- Notifications
notifications (id, user_id, type, title, message, data_json, read_at, created_at)
```

### 4.5 API Design

#### REST API Structure:

```
/api/v1/
├── auth/
│   ├── POST   /login              # Authenticate user
│   ├── POST   /refresh            # Refresh access token
│   ├── POST   /logout             # Invalidate session
│   └── GET    /me                 # Get current user
│
├── users/
│   ├── GET    /                   # List users (admin)
│   ├── POST   /                   # Create user (admin)
│   ├── GET    /:id                # Get user
│   ├── PATCH  /:id                # Update user
│   ├── DELETE /:id                # Delete user (admin)
│   └── PATCH  /:id/password       # Change password
│
├── projects/
│   ├── GET    /                   # List projects (with filters, search, pagination)
│   ├── POST   /                   # Create project
│   ├── GET    /:id                # Get project
│   ├── PATCH  /:id                # Update project
│   ├── DELETE /:id                # Delete project
│   ├── POST   /:id/publish        # Publish draft
│   ├── POST   /:id/unpublish      # Unpublish to draft
│   ├── GET    /:id/revisions      # Get revision history
│   └── POST   /:id/revert/:revId  # Revert to revision
│
├── clients/
│   ├── (same pattern as projects)
│
├── services/
│   ├── (same pattern)
│
├── team-members/
│   ├── (same pattern)
│
├── media/
│   ├── GET    /                   # List media (with search, filters)
│   ├── POST   /upload             # Upload file(s)
│   ├── GET    /:id                # Get media details
│   ├── PATCH  /:id                # Update metadata (alt text, etc.)
│   ├── DELETE /:id                # Delete media
│   ├── POST   /move               # Move to folder
│   └── GET    /folders            # List folders
│
├── menus/
│   ├── GET    /                   # List menus
│   ├── POST   /                   # Create menu
│   ├── GET    /:id                # Get menu with items
│   ├── PATCH  /:id                # Update menu
│   ├── DELETE /:id                # Delete menu
│   └── PATCH  /:id/items          # Reorder items
│
├── pages/
│   ├── (same pattern)
│   └── GET    /:id/preview        # Preview with draft content
│
├── posts/
│   ├── (same pattern)
│
├── settings/
│   ├── GET    /                   # Get all settings
│   └── PATCH  /                   # Update settings
│
├── forms/
│   ├── GET    /submissions        # List form submissions
│   ├── GET    /submissions/:id    # Get submission detail
│   └── PATCH  /submissions/:id    # Update status
│
├── search/
│   └── GET    /                   # Global search across all content
│
├── ai/
│   ├── POST   /generate-seo       # Generate SEO metadata
│   ├── POST   /generate-slug      # Generate URL slug
│   ├── POST   /translate          # Translate content
│   ├── POST   /summarize          # Summarize content
│   ├── POST   /suggest-keywords   # Suggest keywords
│   └── POST   /alt-text           # Generate image alt text
│
├── dashboard/
│   ├── GET    /stats              # Dashboard statistics
│   ├── GET    /activity           # Recent activity
│   └── GET    /analytics          # Content analytics
│
└── admin/
    ├── GET    /audit-log          # Audit trail
    ├── GET    /notifications      # User notifications
    └── PATCH  /notifications/:id  # Mark notification read
```

### 4.6 Module Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY (NestJS)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │   Auth   │ │  Users   │ │ Content  │ │  Media   │       │
│  │ Module   │ │  Module  │ │  Module  │ │  Module  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │   Menu   │ │  Pages   │ │ Settings │ │  Forms   │       │
│  │  Module  │ │  Module  │ │  Module  │ │  Module  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │   AI     │ │ Dashboard│ │  Search  │ │ Notif.   │       │
│  │  Module  │ │  Module  │ │  Module  │ │  Module  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  ┌──────────────────────────────────────────────────┐       │
│  │              SHARED KERNEL                        │       │
│  │  Guards, Interceptors, Pipes, DTOs, Guards        │       │
│  └──────────────────────────────────────────────────┘       │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│              INFRASTRUCTURE LAYER                            │
│  Prisma, MinIO, Redis, JWT, AI Provider, Email              │
└─────────────────────────────────────────────────────────────┘
```

### 4.7 Folder Structure (New CMS)

```
parto-cms/
├── apps/
│   ├── api/                          # NestJS Backend
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── common/               # Shared utilities
│   │   │   │   ├── decorators/
│   │   │   │   ├── filters/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── middleware/
│   │   │   │   ├── pipes/
│   │   │   │   └── dto/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.module.ts
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── strategies/
│   │   │   │   │   ├── guards/
│   │   │   │   │   └── dto/
│   │   │   │   ├── users/
│   │   │   │   ├── content/           # Projects, Clients, Services, Team, Categories
│   │   │   │   │   ├── projects/
│   │   │   │   │   ├── clients/
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── team-members/
│   │   │   │   │   ├── categories/
│   │   │   │   │   ├── testimonials/
│   │   │   │   │   ├── awards/
│   │   │   │   │   ├── partners/
│   │   │   │   │   └── equipment/
│   │   │   │   ├── pages/
│   │   │   │   ├── posts/             # Blog
│   │   │   │   ├── media/
│   │   │   │   ├── menus/
│   │   │   │   ├── settings/
│   │   │   │   ├── forms/             # Form submissions
│   │   │   │   ├── search/
│   │   │   │   ├── ai/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── notifications/
│   │   │   │   └── audit/
│   │   │   ├── prisma/
│   │   │   │   ├── schema.prisma
│   │   │   │   ├── migrations/
│   │   │   │   └── seed.ts
│   │   │   └── config/
│   │   ├── test/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── admin/                        # Next.js Admin Dashboard
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/            # Login, register
│       │   │   │   ├── login/page.tsx
│       │   │   │   └── layout.tsx
│       │   │   ├── (dashboard)/       # Authenticated routes
│       │   │   │   ├── layout.tsx
│       │   │   │   ├── page.tsx       # Dashboard home
│       │   │   │   ├── projects/
│       │   │   │   ├── clients/
│       │   │   │   ├── services/
│       │   │   │   ├── team/
│       │   │   │   ├── blog/
│       │   │   │   ├── pages/
│       │   │   │   ├── media/
│       │   │   │   ├── menus/
│       │   │   │   ├── settings/
│       │   │   │   ├── forms/
│       │   │   │   ├── users/
│       │   │   │   └── ai/
│       │   │   └── api/               # Next.js API routes (proxy)
│       │   ├── components/
│       │   │   ├── ui/                # Base UI components (shadcn/ui)
│       │   │   ├── layout/            # Sidebar, Header, etc.
│       │   │   ├── forms/             # Form components
│       │   │   ├── editors/           # Rich text, media picker
│       │   │   └── shared/            # Shared components
│       │   ├── hooks/                 # Custom React hooks
│       │   ├── lib/                   # Utilities
│       │   │   ├── api.ts             # API client
│       │   │   ├── auth.ts            # Auth helpers
│       │   │   ├── utils.ts
│       │   │   └── constants.ts
│       │   ├── stores/                # State management (zustand)
│       │   └── types/                 # TypeScript types
│       ├── public/
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   ├── shared/                        # Shared types & utilities
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── constants/
│   │   │   └── utils/
│   │   └── package.json
│   └── ui/                            # Shared UI components
│       ├── src/
│       └── package.json
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── nginx/
│   └── nginx.conf
├── turbo.json
├── package.json                       # Root workspace
└── .env.example
```

### 4.8 UI/UX Design

#### Dashboard Layout:
```
┌──────────────────────────────────────────────────────────────┐
│ ☰ Parto CMS        🔍 Search...         🔔  👤 Admin ▾     │
├────────┬─────────────────────────────────────────────────────┤
│        │                                                     │
│ 📊     │  Dashboard                                         │
│ 📁     │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ 🎬     │  │Projects │ │ Clients │ │  Views  │ │  Leads  │ │
│ 👥     │  │   47    │ │   32    │ │  12.4K  │ │    8    │ │
│ 🧰     │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ │
│ 📝     │                                                     │
│ 🖼️     │  Recent Activity              Quick Actions         │
│ 📄     │  ┌──────────────────────┐  ┌──────────────────┐   │
│ ⚙️     │  │ • New project added  │  │ + New Project    │   │
│        │  │ • Client updated     │  │ + New Client     │   │
│        │  │ • 3 media uploaded   │  │ + Write Post     │   │
│        │  │ • Blog post published│  │ + Upload Media   │   │
│        │  └──────────────────────┘  └──────────────────┘   │
│        │                                                     │
└────────┴─────────────────────────────────────────────────────┘
```

#### Key UI Features:
1. **Command Palette** (⌘K) — Navigate, create, search everything
2. **Keyboard Shortcuts** — Every action reachable via keyboard
3. **Resizable Panels** — Drag to resize sidebar/content
4. **Split View** — Edit content with live preview side-by-side
5. **Context Menus** — Right-click for quick actions
6. **Drag & Drop** — Reorder items, upload media, build menus
7. **Inline Editing** — Click to edit titles, descriptions
8. **Bulk Selection** — Checkbox multi-select with batch actions
9. **Infinite Scroll** — Smooth content loading
10. **Toast Notifications** — Non-intrusive success/error messages
11. **Dark/Light Theme** — Both supported, dark by default
12. **Glass Morphism** — Subtle backdrop-blur on overlays
13. **Smooth Animations** — 60fps transitions throughout
14. **Responsive** — Works on tablet and desktop

### 4.9 Permissions System (RBAC)

```typescript
// Permission Matrix
const PERMISSIONS = {
  // Content
  'projects:read': 'View projects',
  'projects:create': 'Create projects',
  'projects:update': 'Edit projects',
  'projects:delete': 'Delete projects',
  'projects:publish': 'Publish/unpublish projects',
  
  // Same pattern for: clients, services, team, categories, blog, pages, equipment
  
  // Media
  'media:read': 'View media library',
  'media:upload': 'Upload files',
  'media:delete': 'Delete files',
  
  // Admin
  'users:manage': 'Manage users',
  'settings:manage': 'Manage site settings',
  'menus:manage': 'Manage navigation',
  'forms:read': 'View form submissions',
  
  // Dashboard
  'dashboard:read': 'View dashboard',
  'audit:read': 'View audit logs',
  
  // AI
  'ai:use': 'Use AI features',
};

// Role Definitions
const ROLES = {
  super_admin: '*', // All permissions
  admin: [
    'projects:*', 'clients:*', 'services:*', 'team:*',
    'categories:*', 'blog:*', 'pages:*', 'equipment:*',
    'media:*', 'settings:*', 'menus:*', 'forms:*',
    'dashboard:*', 'audit:*', 'ai:*',
  ],
  editor: [
    'projects:read', 'projects:create', 'projects:update',
    'clients:read', 'clients:create', 'clients:update',
    'services:read', 'services:create', 'services:update',
    'team:read', 'team:create', 'team:update',
    'categories:read', 'blog:read', 'blog:create', 'blog:update',
    'pages:read', 'pages:create', 'pages:update',
    'media:read', 'media:upload',
    'dashboard:read', 'ai:use',
  ],
  viewer: [
    'projects:read', 'clients:read', 'services:read',
    'team:read', 'categories:read', 'blog:read', 'pages:read',
    'media:read', 'dashboard:read',
  ],
};
```

### 4.10 Media System Design

```
Upload Flow:
1. User drops file(s) or clicks upload
2. Frontend shows upload progress bar
3. File sent to /api/v1/media/upload
4. Backend validates file type & size
5. File stored in MinIO S3 bucket
6. Backend generates:
   - Thumbnail (300px)
   - Medium (800px)
   - Large (1600px)
   - WebP variant
7. Metadata saved to PostgreSQL
8. Response with all variants returned
9. Frontend updates media library

Storage Structure:
minio/
├── originals/          # Original uploads
│   ├── 2026/07/
│   └── ...
├── thumbnails/         # 300px variants
├── medium/            # 800px variants
├── large/             # 1600px variants
└── webp/              # WebP variants
```

### 4.11 AI Integration Design

| Feature | Input | Output | Model |
|---------|-------|--------|-------|
| Generate SEO | Content text | Title, description, keywords | GPT-4/Claude |
| Generate Slug | Title | URL slug | Rules + NLP |
| Translate | Content + target lang | Translated content | GPT-4/Claude |
| Summarize | Long content | Short summary | GPT-4/Claude |
| Suggest Keywords | Content | Keyword list | GPT-4/Claude |
| Alt Text | Image URL | Description | Vision model |
| Content Score | Content | Quality score + suggestions | GPT-4 |
| Auto-categorize | Content | Category suggestion | GPT-4 |

### 4.12 Draft/Publish Workflow

```
States:
  draft → in_review → published → archived
    ↑                              │
    └──────────────────────────────┘

Features:
- Auto-save every 30 seconds
- Draft visible only to editors/admins
- Preview URL with draft token
- Publishing requires permission
- Unpublish returns to draft
- Scheduled publishing support
- Revision created on every publish
- Diff view between revisions
```

---

## PART 5: IMPLEMENTATION PLAN

### Phase 1: Foundation (Weeks 1-3)
1. Initialize monorepo (Turborepo)
2. Set up NestJS with Prisma + PostgreSQL
3. Set up Next.js admin with shadcn/ui
4. Implement auth (JWT + refresh tokens)
5. Docker Compose (API, Admin, PostgreSQL, Redis, MinIO)
6. Database schema & migrations
7. Base UI layout (sidebar, header, dashboard)

### Phase 2: Core Content (Weeks 4-6)
8. Projects CRUD with translations
9. Clients CRUD with translations
10. Services CRUD
11. Team Members CRUD
12. Categories CRUD
13. Media library with upload
14. Rich text editor (TipTap)

### Phase 3: Advanced Features (Weeks 7-9)
15. Draft/Publish workflow
16. Revision history
17. Search (PostgreSQL full-text)
18. Menu builder
19. Page builder (block-based)
20. Settings management
21. Form submissions

### Phase 4: Intelligence (Weeks 10-11)
22. AI: SEO generation
23. AI: Slug generation
24. AI: Content translation
25. AI: Content scoring
26. Dashboard analytics

### Phase 5: Polish (Week 12)
27. Keyboard shortcuts
28. Command palette
29. Dark/Light theme toggle
30. Activity log & audit trail
31. Notifications
32. Performance optimization
33. Documentation
34. Deployment configuration

---

## PART 6: COMPARISON — OLD vs NEW

| Aspect | Old CMS (Sanity) | New CMS (Custom) |
|--------|-------------------|-------------------|
| **Hosting** | Sanity Cloud (SaaS) | Self-hosted (Docker) |
| **Auth** | None (Studio open) | JWT + RBAC |
| **Database** | Sanity proprietary | PostgreSQL |
| **Query Language** | GROQ (proprietary) | REST API + Prisma |
| **Content Modeling** | Sanity schemas | Prisma + translations |
| **Localization** | Inline {fa,en} | Separate translation tables |
| **Media** | Sanity assets | MinIO S3 |
| **Draft/Preview** | Not implemented | Full workflow |
| **Revision History** | Not available | Built-in |
| **Custom UI** | Sanity Studio only | Fully custom admin |
| **AI Features** | None | 8 AI-powered tools |
| **Page Builder** | Sections only | Block-based builder |
| **Search** | None | Full-text search |
| **Bulk Operations** | None | Multi-select actions |
| **API Consumers** | None | REST API ready |
| **Vendor Lock-in** | High (Sanity) | None (open source) |
| **Cost** | Sanity pricing tiers | Self-hosted (infra only) |
| **Extensibility** | Limited | Fully modular |

---

*This document serves as the architectural foundation for the Parto CMS rebuild. All implementation decisions should reference this document.*