# Parto — Event Production Company Website

A bilingual (Persian RTL / English LTR) website for Parto, an event production company, powered by **Next.js 16**, **next-intl**, **Framer Motion**, and **Tailwind CSS v4**, backed by a self-hosted **Parto CMS** (NestJS + Prisma + PostgreSQL).

All content — services, projects, clients, team members, posts, pages, settings — is managed through the Parto CMS admin panel. No third-party SaaS CMS, no hardcoded data files.

> **Note:** This project previously used Sanity CMS. Sanity has been fully removed and replaced by the in-house CMS in `parto-cms/`. If you are looking for `/studio`, `sanity.config.ts`, or `SANITY_*` env vars — they no longer exist.

---

## Repository Layout

| Path | What it is | Default port |
|---|---|---|
| `/` (root) | Public marketing website (Next.js 16, App Router) | `3000` |
| `parto-cms/apps/api` | CMS REST API (NestJS + Prisma) | `3006` |
| `parto-cms/apps/admin` | CMS admin dashboard (Next.js) | `3003` |
| `parto-ems/` | Event management system (separate app) | `3001` |
| `parto-oms/` | Order management workspace (early stage) | — |

The public website is a **read-only consumer** of the CMS public API. It never touches the database directly.

---

## Quick Start (Windows)

### 1. Prerequisites

- Node.js 20+
- Docker Desktop (for PostgreSQL, Redis, MinIO)

### 2. Start the CMS infrastructure

```bat
cd parto-cms
copy .env.example apps\api\.env
npm install
npm run docker:up
npm run db:push
npm run db:seed
```

**Why `apps\api\.env` and not `parto-cms\.env`?** The API reads its environment from its
own directory — `envFilePath: ['.env.local', '.env']` in `apps/api/src/app.module.ts`
resolves relative to the API's working directory. A `.env` at the `parto-cms/` root is
never loaded. Prisma also resolves `DATABASE_URL` from `apps/api` when the schema lives there.

**Why `db:push` and not `db:migrate`?** This project has **no `prisma/migrations/` directory** —
the schema is applied declaratively with `prisma db push`. Running `db:migrate` on a fresh
clone would try to create an initial migration and prompt interactively. Use `db:push` for
local setup; introduce `prisma migrate` properly before the first production deployment
(see "Known gaps" below).

`docker:up` starts PostgreSQL, Redis and MinIO via `docker-compose.yml`. Note the published
ports are deliberately non-default to avoid clashing with local installs:

| Service | Host port | Container port |
|---|---|---|
| PostgreSQL | `55432` | 5432 |
| Redis | `6379` | 6379 |
| MinIO (S3 API) | `9002` | 9000 |
| MinIO (console) | `9003` | 9001 |

`db:seed` creates the default admin user defined by `DEFAULT_ADMIN_EMAIL` /
`DEFAULT_ADMIN_PASSWORD` in `apps/api/.env`. The seed is idempotent — re-running it
updates the existing admin rather than failing.

When those variables are unset, the seed falls back to these credentials — use them
to sign in at http://localhost:3003/login:

| Role | Email | Password |
| --- | --- | --- |
| `SUPER_ADMIN` | `admin@parto.ir` | `AdminPassword2026` |
| `EDITOR` | `editor@parto.ir` | `EditorPassword2026` |

These are development defaults only. Set `DEFAULT_ADMIN_PASSWORD` in `apps/api/.env`
and re-run `npm run db:seed` before exposing the CMS anywhere non-local.


> ⚠️ **Change `JWT_SECRET`, `JWT_REFRESH_SECRET` and `DEFAULT_ADMIN_PASSWORD` before deploying anywhere non-local.** The values in `.env.example` are placeholders only.


### 3. Run the CMS (API + admin)

```bat
cd parto-cms
npm run dev
```

- API: <http://localhost:3006>
- API docs (Swagger): <http://localhost:3006/docs>
- Admin dashboard: <http://localhost:3003>

### 4. Run the public website

From the repository root, in a second terminal:

```bat
copy .env.example .env.local
npm install
npm run dev
```

- Website: <http://localhost:3000>

`.env.local` only needs one variable:

| Variable | Purpose | Default |
|---|---|---|
| `CMS_API_URL` | Base URL of the CMS public API consumed by the website | `http://localhost:3006/api/v1/api/public` |

---

## For the Website Owner (Non-Developer)

Log in to the admin dashboard at <http://localhost:3003> (or your deployed admin URL) with your CMS account.

### Publishing rules

Every content type has a **status**. Only items with status **PUBLISHED** appear on the public website — drafts stay private. Team members use an **Active** toggle instead of a status.

### How to add a Client

1. Sidebar → **Clients** → **New**.
2. Fill in the name, slug, logo, and description.
3. Tick **Featured** to surface the client on the homepage.
4. Set **Display Order** — lower numbers appear first.
5. Set status to **Published** and save.

### How to add a Project

1. Sidebar → **Projects** → **New**.
2. Fill in title, slug, description, and thumbnail.
3. Link one or more **Clients** to the project.
4. Tick **Featured** to show it on the homepage.
5. Set status to **Published** and save.

### How to add a Team Member

1. Sidebar → **Team** → **New**.
2. Fill in name, role, photo, and bio.
3. Set **Order** to control position on the team page.
4. Ensure **Active** is on, then save.

### Other sections

- **Services** — service offerings shown on the homepage and services page (ordered by `order`).
- **Posts / Categories** — the blog.
- **Pages** — standalone content pages addressed by slug.
- **Media** — uploaded images; served from `/uploads` on the API.
- **Settings** — key/value site settings (contact details, social links, SEO defaults).

---

## For Developers

### Content flow

```
PostgreSQL → Prisma → NestJS public controller (/api/v1/api/public)
           → src/lib/cms/data.ts (fetch wrapper) → React Server Components
```

The website's entire data-access layer lives in [`src/lib/cms/data.ts`](src/lib/cms/data.ts). Components never call the API directly.

### Public API endpoints

All are unauthenticated and filtered to published content, served under the `CMS_API_URL` base:

| Endpoint | Returns |
|---|---|
| `GET /clients` | Paginated clients (`?featured=true` supported) |
| `GET /clients/:slug` | Single client with services + projects |
| `GET /services` | Paginated services |
| `GET /services/:slug` | Single service |
| `GET /projects` | Paginated projects (`?featured=true`, `?clientId=`) |
| `GET /projects/:slug` | Single project with clients |
| `GET /team` | Active team members |
| `GET /posts` | Paginated posts (`?categoryId=`) |
| `GET /posts/:slug` | Single post |
| `GET /categories` | Categories (`?type=`) |
| `GET /pages/:slug` | Single page |
| `GET /settings` | All settings as an object |
| `GET /settings/:key` | One setting value |
| `GET /media/:id` | Media record with resolved `url` |
| `GET /stats` | Published counts (clients, projects, team, posts) |

List endpoints return `{ items, meta: { total, page, limit, totalPages } }`.

### Project structure (website)

```
├── middleware.ts              # next-intl locale routing
├── src/
│   ├── app/[locale]/          # Localized routes (layout, home, team, clients/[slug])
│   ├── components/            # UI components — all consume CMS data
│   ├── i18n/                  # next-intl routing & request config
│   ├── lib/cms/data.ts        # Typed CMS data-access functions
│   └── messages/              # UI chrome translations (fa.json, en.json)
```

Content strings come from the CMS; only static UI labels live in `src/messages/`.

### NPM scripts

**Website (root)**

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

**CMS (`parto-cms/`)**

| Script | Description |
|---|---|
| `npm run dev` | Run API + admin via Turborepo |
| `npm run build` | Build all CMS apps |
| `npm run db:push` | Sync the schema to the database (**use this** — no migrations exist yet) |
| `npm run db:migrate` | Prisma migrate dev — only once a `migrations/` history exists |
| `npm run db:seed` | Seed the database (idempotent) |
| `npm run db:studio` | Open Prisma Studio |
| `npm run docker:up` / `docker:down` / `docker:logs` | Manage infrastructure containers |

### Adding a new content type

1. Add the model to `parto-cms/apps/api/prisma/schema.prisma`, then `npm run db:push`.
2. Add a service/controller under `parto-cms/apps/api/src/modules/`.
3. Expose a read endpoint in `modules/public/public.controller.ts` (filter by `status: 'PUBLISHED'`).
4. Add an admin screen under `parto-cms/apps/admin/src/app/dashboard/`.
5. Add a typed fetch function in `src/lib/cms/data.ts`.
6. Consume it from a server component.

### Known gaps

Things a new maintainer should know before trusting this setup in production:

- **No Prisma migration history.** `prisma/migrations/` does not exist; the schema is
  applied with `db push`. Before the first production deploy, run
  `npx prisma migrate dev --name init` against a scratch database to bake the current
  schema into an initial migration, then switch releases to `prisma migrate deploy`.
  Until then, `db:migrate:prod` has nothing to apply.
- **No automated tests.** There is no test runner configured in any workspace. Verification
  today is manual: type-check, build, and hitting the endpoints.
- **Website build does not require the CMS, but degrades quietly.** `fetchCMS()` in
  `src/lib/cms/data.ts` swallows fetch failures and returns `null`, so `npm run build`
  succeeds even when the API is down — it just emits placeholder dynamic params
  (e.g. `/fa/clients/placeholder`) and empty sections. **Start the CMS API before building
  for production**, otherwise you ship a site with no content baked in.
- **Public API is intentionally unauthenticated.** Everything under `/api/v1/api/public`
  is open by design and filtered to `PUBLISHED` records. Do not add non-public fields to
  those responses. There is no rate limiting in front of it.
- **Media is served from the API.** Uploads resolve to `/uploads` on the API host, so the
  API must be publicly reachable for images to load on the website.
- **`parto-ems/` and `parto-oms/`** are separate, partially built apps. They are not part
  of the website + CMS flow and are not covered by this setup guide.

---


## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16 | App Router, RSC, image optimization |
| React | 19 | UI library (React Compiler enabled) |
| next-intl | 4 | Internationalization (fa/en, RTL/LTR) |
| NestJS | 11 | CMS REST API |
| Prisma | 6 | ORM / migrations |
| PostgreSQL | 16 | Primary datastore |
| Redis | 7 | Caching |
| MinIO | — | S3-compatible media storage |
| @portabletext/react | 6 | Rich-text renderer |
| Framer Motion | 12 | Animations |
| Tailwind CSS | 4 | Styling |
| TypeScript | 5 | Type safety |

---

## Deployment

1. **Create the initial migration first** (one-time) — see "Known gaps". Until
   `prisma/migrations/` exists, `prisma migrate deploy` is a no-op and the production
   schema will not be created.
2. Deploy `parto-cms/apps/api` with PostgreSQL, Redis and object storage. Place its
   environment in the API's own working directory and run `prisma migrate deploy`
   (or `prisma db push` if you have accepted the no-migrations tradeoff) on release.
3. Deploy `parto-cms/apps/admin`, pointing `NEXT_PUBLIC_API_URL` at the API.
4. Deploy the root website with `CMS_API_URL` pointing at the API's public base path.
   Ensure the API is reachable **at build time** so content is prerendered.
5. Set `ADMIN_URL` on the API so CORS allows the deployed admin origin.
6. Replace every secret from `.env.example` with generated values — especially
   `JWT_SECRET`, `JWT_REFRESH_SECRET`, `DEFAULT_ADMIN_PASSWORD`, the database password
   and the MinIO credentials.

