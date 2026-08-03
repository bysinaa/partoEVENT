# Parto — Event Production Company Website

A bilingual (Persian RTL / English LTR) website for Parto, an event production company, powered by **Next.js 16**, **next-intl**, **Sanity CMS**, **Framer Motion**, and **Tailwind CSS v4**.

All content — services, projects, clients, team members, homepage layout, SEO — is managed through Sanity CMS. No hardcoded data files. No code changes needed for content updates.

---

## Quick Start

### 1. Prerequisites

- Node.js 18.18+ (or 20+)
- A free [Sanity](https://www.sanity.io) account

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Copy `.env.example` to `.env.local` and fill in your Sanity project credentials:

```bash
copy .env.example .env.local
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | [sanity.io/manage](https://www.sanity.io/manage) → your project → API → Project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | Same page → Dataset (default: `production`) |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Use `2024-10-01` |
| `SANITY_API_READ_TOKEN` | Same page → API → Tokens → Add token (Read role). Required if your dataset is private. |

### 4. Configure CORS origins

The embedded Sanity Studio runs at `http://localhost:3000/studio` and makes
cross-origin API requests to Sanity's servers from the browser. You must
whitelist your origin so the Studio can load and save content.

**Option A — Sanity CLI (recommended)**

```bash
# Allow localhost for local development (with credentials for the Studio)
npx sanity cors add http://localhost:3000 --credentials

# Later, add your production domain:
npx sanity cors add https://yourdomain.com --credentials
```

**Option B — Sanity dashboard**

1. Go to [sanity.io/manage](https://www.sanity.io/manage) → your project → API → CORS Origins
2. Click **Add CORS Origin**
3. Add `http://localhost:3000` and check **Allow credentials**
4. Repeat for your production domain when deploying

> **Why?** Without this, the Studio shows a CORS error and cannot load data.
> See [Sanity CORS docs](https://www.sanity.io/docs/cors).

### 5. Run the development server

```bash
npm run dev
```

- Website: [http://localhost:3000](http://localhost:3000)
- Sanity Studio: [http://localhost:3000/studio](http://localhost:3000/studio)

---

## For the Website Owner (Non-Developer)

### Accessing the Studio

Visit `/studio` on your website (e.g. `https://yourdomain.com/studio`). Log in with your Sanity account.

### How to add a Client (under 2 minutes)

1. In the Studio sidebar, click **👥 Clients**.
2. Click the **Create** button (top right).
3. Fill in:
   - **Name** — the client's name in Persian
   - **English Name** — the client's name in English
   - **Logo** — upload the client's logo image
   - **Featured** — check if this client should be highlighted
   - **Display Order** — lower numbers appear first (default: 100)
4. Click **Publish**. The client appears on the website immediately (in development) or within 60 seconds (in production).

### How to add a Project (under 3 minutes)

1. In the Studio sidebar, click **🎬 Projects**.
2. Click **Create**.
3. Fill in:
   - **Title** — in Persian and English
   - **Client** — select the client this project belongs to
   - **Category** — select or create a category
   - **Thumbnail** — upload the main project image
   - **Gallery** — upload additional images
   - **Event Date** — when the event took place
   - **Featured** — check to show on the homepage
   - **Description** — rich text in Persian and English
4. Click **Publish**.

### Managing the Homepage Layout

1. Click **🏠 Home Page** in the Studio sidebar.
2. Under **Sections**, you'll see a list of homepage sections (Hero, Services, Featured Projects, Clients, Stats, Team, Contact).
3. **Drag** sections to reorder them. The website renders sections in this order.
4. Uncheck **Enabled** to hide a section without deleting it.
5. Under **Stats**, add/edit the key metrics (e.g. "+300 Projects").
6. Under **Hero**, edit the hero badge, title, description, and buttons.
7. Click **Publish**.

### Site Settings

Click **⚙️ Site Settings** to manage:

- Company name, phone, email, address, working hours
- Social media links (Instagram, LinkedIn, Telegram, WhatsApp, YouTube, Aparat)
- Logo
- Footer text
- SEO defaults (title, description, OG image)

### Localization

Every important text field has both **Persian (fa)** and **English (en)** inputs. Fill in both — the website automatically shows the correct language based on the visitor's locale. If a translation is missing, the Persian value is used as a fallback.

---

## For Developers

### Project Structure

```
├── sanity.config.ts          # Root Studio config (for CLI typegen)
├── sanity.cli.ts             # Sanity CLI config (projectId/dataset)
├── sanity-typegen.json       # Type generation config
├── sanity.types.ts           # ⚙️ Auto-generated — do not edit
├── schema.json               # ⚙️ Auto-generated — do not edit
├── src/
│   ├── app/
│   │   ├── [locale]/          # Localized website routes
│   │   │   ├── layout.tsx    # Root layout (SEO metadata from Sanity)
│   │   │   ├── page.tsx      # Homepage (renders Sanity-controlled sections)
│   │   │   └── not-found.tsx
│   │   └── studio/           # Embedded Sanity Studio at /studio
│   ├── components/            # React components (all consume Sanity data)
│   ├── i18n/                  # next-intl routing & request config
│   ├── lib/
│   │   └── sanity/
│   │       ├── client.ts     # Sanity client
│   │       ├── data.ts       # Typed data-access functions
│   │       ├── fetch.ts      # Cached fetch wrapper
│   │       ├── image.ts      # Image URL builder
│   │       └── types.ts      # Type-narrowing helpers (asText, asPortableText)
│   ├── messages/             # next-intl translation JSON (fa.json, en.json)
│   └── sanity/
│       ├── env.ts             # Environment variable validation
│       ├── structure.ts      # Studio desk structure (sidebar)
│       ├── sanity.config.ts  # Studio config (schema, plugins, templates)
│       ├── schemas/           # Schema definitions
│       │   ├── documents/    # Document types (client, project, etc.)
│       │   ├── objects/      # Object types (localizedString, seo, etc.)
│       │   └── index.ts      # Schema registry
│       └── queries/          # GROQ queries (type-safe)
```

### Architecture Overview

**Content flow:** Sanity CMS → GROQ queries → `sanityFetch<T>` (cached) → React components

**Localization strategy:** Localized fields are stored as `{ fa, en }` objects in Sanity. Queries use `coalesce(field[$lang], field.fa)` to resolve the active locale at query time. This works on the free Sanity plan without any i18n plugin.

**Type generation:** `sanity-typegen` reads the GROQ queries and schema, generating TypeScript types in `sanity.types.ts`. Every query has a corresponding `*QueryResult` type.

**Type narrowing:** Because `sanity-typegen` can't statically resolve dynamic key access (`field[$lang]`), localized fields get a conservative union type (`string | Array<{...}> | null`). The helpers `asText()` and `asPortableText()` in [`src/lib/sanity/types.ts`](src/lib/sanity/types.ts) narrow these to the runtime-correct primitives.

### NPM Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server (website + Studio) |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run sanity:extract` | Extract schema to `schema.json` |
| `npm run sanity:typegen` | Extract schema + generate TypeScript types |
| `npm run sanity:studio` | Launch standalone Sanity Studio (optional) |

### Regenerating Types After Schema Changes

Whenever you modify a schema or query:

```bash
npm run sanity:typegen
```

This regenerates `sanity.types.ts` with updated types. The `@sanity.types` path alias in `tsconfig.json` maps to this file.

### Caching

- **Production:** Queries are cached and revalidated every 60 seconds.
- **Development:** Caching is disabled (`revalidate: 0`) so content edits appear instantly.
- **On-demand:** Use `revalidateTag("client")` or `revalidateTag("project")` after webhooks for instant updates.

### Image Optimization

All images go through Sanity's image pipeline (`cdn.sanity.io`) with Next.js `<Image>` for automatic format conversion, responsive `srcset`, and lazy loading. The `next.config.ts` is configured with `remotePatterns` for `cdn.sanity.io`.

### Adding a New Schema

1. Create the schema file in `src/sanity/schemas/documents/` (or `objects/`).
2. Register it in [`src/sanity/schemas/index.ts`](src/sanity/schemas/index.ts).
3. Create a GROQ query in `src/sanity/queries/`.
4. Export the query from [`src/sanity/queries/index.ts`](src/sanity/queries/index.ts).
5. Run `npm run sanity:typegen`.
6. Add a data-access function in [`src/lib/sanity/data.ts`](src/lib/sanity/data.ts).
7. Use the typed data in your component.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16 | App Router, RSC, image optimization |
| React | 19 | UI library (React Compiler enabled) |
| next-intl | 4 | Internationalization (fa/en, RTL/LTR) |
| Sanity | 6 | Headless CMS |
| next-sanity | 13 | Next.js + Sanity integration |
| @sanity/image-url | 2 | Image URL builder |
| @portabletext/react | 6 | Portable Text renderer |
| Framer Motion | 12 | Animations |
| Tailwind CSS | 4 | Styling |
| TypeScript | 5 | Type safety |

---

## Deployment

The website and Studio are deployed together as a single Next.js app. No separate Studio hosting needed.

1. Push to your Git repository.
2. Deploy on Vercel (or your preferred platform).
3. Set the environment variables (from `.env.example`) in your hosting dashboard.
4. The Studio is available at `/studio` on your production domain.
