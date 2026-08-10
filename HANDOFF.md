# Parto — Handoff

Status of the pitch-deck redesign work. This document is deliberately explicit
about what is **implemented and verified** versus what is **still outstanding**,
so the next person does not have to rediscover it.

**Overall: theme selection works end-to-end (CMS → database → website), and
every public component now consumes theme tokens. Brief items 3, 5, 6, 7 and 8
(artwork, media cropping, section flow, contact section, Kelvin interaction) are
NOT yet implemented.** See "Remaining work".

---

## Architecture (unchanged, confirmed)

- **Frontend** — Next.js App Router, `src/`, bilingual via `next-intl`
  (`fa` default + `en`, `localePrefix: "always"`). RTL/LTR is driven by `dir` on
  `<html>`.
- **CMS** — `parto-cms/`, a Turborepo with:
  - `apps/api` — NestJS + Prisma + PostgreSQL. Public read endpoints live under
    `/api/public/*`; authenticated CRUD under `/api/v1/*` (JWT).
  - `apps/admin` — Next.js admin dashboard talking to the API via `axios`.
- **No Sanity.** No Sanity client, config, schema or `@sanity/*` dependency
  exists, and none was introduced.

  One caveat, stated precisely because an earlier draft of this document got it
  wrong: `src/components/PortableText.tsx` **does** import `@portabletext/react`
  and `@portabletext/types`, and both are in `package.json`. These are
  **pre-existing** — they are present in the baseline commit (`6edb76f`), not
  added by this work. They are the standalone Portable Text renderer, not the
  Sanity SDK, and they talk to no Sanity service. But the packages are
  Sanity-authored, so if the intent behind "no Sanity" is "no Sanity-lineage
  dependencies at all", this is the one thing to look at. Nothing new depends on
  it; the CMS uses its own block format.

Frontend reads the CMS through `src/lib/cms/data.ts` using `cache: "no-store"`,
and pages set `dynamic = "force-dynamic"`. This is why a CMS save + browser
reload is enough to change the site — no rebuild, no redeploy.

---

## What was implemented

### 1. Theme system — `src/lib/theme/themes.ts`

All eight themes are defined: Solar Refined, Warm Light, Deep Night, Minimal
Mono, Aurora Green, Soft Lilac, Steel Blue, Sand Dune.

Each defines the full token set required by the brief: page background, elevated
surface, secondary surface, primary/secondary text, border, primary/secondary
accent, button background + text, focus, glow/ray, hero + accent gradients, and
header/footer appearance.

Key decisions:

- **One semantic token vocabulary.** Components never branch on theme id; they
  only consume `var(--token)`. Adding a ninth theme means adding one object.
- **No black-and-yellow.** Primary buttons deliberately use an ink/paper pair
  (`buttonBg` = near-black ink, `buttonText` = paper) rather than saturated
  orange on black. Amber survives as *light* — rays, glow, focus, hairlines —
  which is both closer to the brand meaning ("parto" = ray/beam) and avoids the
  adult-content visual cliché called out in the brief.
- **Solar Refined** is warm amber + ivory (`#FCFAF6`) + charcoal (`#1E1A15`) +
  champagne, not orange-on-black.
- **Safe fallback.** `resolveTheme()` accepts `unknown` and never throws; a
  missing/garbage DB value degrades to `FALLBACK_THEME_ID` (`solar-refined`).

Contrast: body/heading colors clear 4.5:1 against their own page background, and
borders/large text clear 3:1. **This is now machine-verified** — `themes.test.ts`
computes WCAG relative luminance for every theme and fails if any pair regresses.
Two accents were darkened as a direct result (see "Verification").

### 2. Typography — `src/lib/theme/typography.ts`

- Uses **only** the fonts already in the repo (`public/fonts/peyda`, 6 weights,
  all filenames verified against disk). No external/CDN fonts are loaded.
- Four CMS-controllable slots: Persian heading, Persian body, English heading,
  English body.
- Three presets give the themes distinct personalities — `editorial`,
  `grotesk`, `humanist` — each with its own tracking, leading, weight and
  eyebrow tracking. Each theme names its default preset.
- `resolveTypography()` validates overrides **per script**: `FA_FONT_KEYS` and
  `EN_FONT_KEYS` are separate, so an editor cannot assign a Latin-only serif to
  the Persian heading slot and break Persian rendering.
- Only the active locale's stacks bind to `--font-heading` / `--font-body`.

### 3. Settings data layer — `src/lib/cms/appearance.ts`

Single canonical source: `GET /api/public/settings`. Provides:

- `resolveAppearance()` — theme + typography, degrading safely at every step
  (CMS unreachable → `null` → fallback theme). A CMS outage cannot take the site
  down.
- `resolveContact()` — normalizes and **sanitizes** contact/social settings:
  - `safeUrl()` accepts only `http:`/`https:`, blocking `javascript:` payloads.
  - `isDialable()` requires at least 7 digits before a `tel:`/`wa.me` link is
    generated, so junk input cannot become a working-looking phone link.
  - WhatsApp accepts a `wa.me` URL *or* a bare phone number.
  - Telegram/Instagram accept a full URL, `@handle`, or bare username.
  - Channels with empty/invalid values, or with their `show*` flag off, are
    omitted entirely rather than rendered as dead links.
- `getGlobalSettings()` — one round-trip for both, so a render is not 3 fetches.

### 4. Stylesheet — `src/app/globals.css`

Rewritten onto the token system. Notable points:

- `:root` holds a Solar Refined fallback so the sheet is valid even without the
  injected block.
- Fluid type via `clamp()` (`.text-hero`, `.section-title`, `.eyebrow`) so
  headings do not break at 320px.
- Existing legacy class names (`.card-*`, `.section-glow-*`, `.text-gradient-*`,
  `.glow-orb`, `.tile-client`) are **aliased onto the tokens**.
- `.media-16x9` reserves `aspect-ratio: 16/9` up front to prevent layout shift,
  and applies focal point via `--focal-x` / `--focal-y`.
- `* { min-width: 0 }` plus `overflow-x: hidden` guards against the classic
  flex/grid horizontal-overflow bug at narrow widths.
- Buttons have a `min-height: 2.75rem` (44px) touch target.
- A single global `prefers-reduced-motion` block neutralizes all animation.

### 5. Theme injection — `src/app/[locale]/layout.tsx`

The layout resolves the theme server-side and inlines the variables into
`<head>`:

- **No FOUC** — first paint is already correct; the CSS cannot arrive late.
- **No hydration mismatch** — the block is derived purely from server data and
  reads no browser state, so server and client markup are identical.
- `data-theme` / `data-theme-mode` are exposed on `<html>` for artwork variants
  and for test/debug selectors.

### 6. Component detokenization

Every public component now reads tokens instead of hardcoded hex: `Hero`,
`Navbar`, `Footer`, `Services`, `Clients`, `Team`, `Stats`, `FeaturedProjects`,
`ClientDetail`, `PortableText`, `LocaleSwitcher`, and `not-found`. No `#RRGGBB`
literal remains in `src/components` or `src/app`. This is what makes theme
switching actually visible — before this pass the plumbing worked but the most
prominent components ignored it.

### 7. Brand assets

The supplied logo files were copied to `public/brand/parto-logo-light.jpg` and
`public/brand/parto-logo-dark.jpg`. **They are not yet used by any component.**

### 8. Settings API — `parto-cms/apps/api/src/modules/entities/settings.contract.ts`

`SiteSetting` turned out to be a **key/value table** (`key`, `value`, `group`),
not a wide model, and `/api/public/settings` already flattens rows into a
`{ key: value }` map — exactly the shape `appearance.ts` expects.

**This means no migration was needed.** New settings are new rows.

The contract file is the single place defining which keys exist, how each is
validated, and which are public:

- `validateSetting()` rejects unknown keys outright, so an admin typo cannot
  create a dead row the frontend will never read.
- Social fields accept a full URL *or* a bare handle, but reject anything
  containing a scheme other than `http(s)` — `javascript:` payloads cannot be
  stored in the first place, in addition to the frontend's `safeUrl()` guard.
- Errors carry **both** English and Persian messages.
- `PUBLIC_SETTING_KEYS` is an **allow-list**, so any CMS-only key added later is
  private by default and cannot leak through forgetting to exclude it.
  `/api/public/settings/:key` returns `null` for private keys — indistinguishable
  from a missing key, so it cannot be used to probe which private keys exist.

`SettingsService` gained `upsertMany()` (route `PUT /api/v1/settings/bulk`),
which validates the whole batch **before** writing and then writes in a
transaction — a half-applied theme + typography change would otherwise leave the
site in a state the editor never chose. Booleans are stored as `'true'`/`'false'`
so the public endpoint's `JSON.parse` yields real booleans for the `show*` flags.

### 9. Admin Settings UI — `parto-cms/apps/admin/src/app/dashboard/settings/`

Replaced the "coming soon" placeholder with a working panel:

- Theme picker as an accessible `radiogroup` with swatch trios and light/dark
  labels. Only swatches live in the admin; the authoritative tokens stay in the
  frontend so there is no second source of truth to drift.
- Selecting a theme moves typography to that theme's default preset **only if**
  the editor had not already overridden it.
- Four font selectors, split Persian/Latin.
- Contact fields (bilingual) and per-channel show/hide toggles.
- The save button sends **only changed keys**, so saving cannot clobber a field
  another editor changed concurrently.

---

## Database changes

**No migration required** — see section 8. Settings are rows in the existing
key/value `SiteSetting` table.

Not yet done: `apps/api/prisma/seed.ts` has **no** default appearance/contact
rows. This is harmless (every frontend read falls back safely, and the admin
form shows defaults for an empty table) but a fresh install starts with no
`websiteTheme` row until an admin saves the Settings page once.

---

## Verification

### Automated (run, passing)

| Check | Command | Result |
| --- | --- | --- |
| Unit tests | `npm test` | **41 pass, 0 fail** |
| Frontend types | `npx tsc --noEmit` | clean |
| Frontend lint | `npx eslint src middleware.ts` | clean |
| Frontend production build | `npm run build` | compiles, 4 routes generated |
| CMS API types | `npx tsc --noEmit` in `apps/api` | clean |
| CMS admin production build | `npm run build` in `apps/admin` | compiles |
| Peyda `@font-face` filenames vs disk | — | all 6 present |

Test files use `node:test` — no new dependencies were added:

- `src/lib/theme/themes.test.ts` (17 tests) — token completeness across all
  eight themes, WCAG contrast maths, fallback resolution for junk/missing ids,
  CSS-variable serialization, translucency of glow/ray colors, and an explicit
  regression test that Solar Refined is not saturated-orange-on-near-black.
- `src/lib/cms/appearance.test.ts` (24 tests) — theme/typography resolution plus
  contact sanitization: handle/URL normalization, hostile input, channel
  visibility, and Persian/English field selection.

**Two real bugs were found by these tests, not by inspection:**

1. `accentPrimary` in *Solar Refined* (`#B26A0C`) and *Warm Light* (`#B25E09`)
   measured 4.42:1 and 4.43:1 — just under AA. Both carry link and metadata
   text, so they were deepened to `#8F5709` / `#9C5107`.
2. `resolveContact` built links from junk input. `normalizePhone` reduced
   `"javascript:alert(1)"` to `"1"`, which was then published as `tel:1` and
   `https://wa.me/1`. `isDialable()` (>= 7 digits) now suppresses the channel.

### Live stack round-trip (RUN — 2026-08-04)

This was the outstanding claim in the previous handoff. It has now been executed
against real infrastructure, and it passes.

Stack used:

- **Postgres** — existing `parto-postgres` container, `localhost:55432`,
  database `parto_cms` (from `parto-cms/apps/api/.env`).
- **CMS API** — `npm run start:dev` in `parto-cms/apps/api`, port **3006**.
  Note the effective public URL is `/api/v1/api/public` (global prefix `api/v1`
  plus controller path `api/public`) — the doubled segment in `.env.local` is
  correct, not a typo.
- **Public site** — `npm run dev`, port **3000**.

Results:

| Check | Result |
| --- | --- |
| Admin login (`POST /auth/login`) | 200, JWT issued |
| Write + public read-back, all 8 themes | **8/8 exact match** |
| Invalid theme (`not-a-theme`) via bulk | **rejected**, bilingual error |
| Stored value after rejected write | unchanged (`sand-dune`) — no partial write |
| `data-theme` on served HTML follows DB | yes (`deep-night`/`solar-refined`/`aurora-green`) |
| `data-theme-mode` follows theme | yes (`dark`/`light`/`dark`) |
| Injected `<style id="parto-theme">` present | yes, values match the selected theme |
| Token names emitted vs consumed | consistent (`--bg` both sides) |
| Persian route | `<html lang="fa" dir="rtl">` |
| English route | `<html lang="en" dir="ltr">` |

Two things worth recording because they cost time:

1. `PUT /api/v1/settings/bulk` takes `{"values":{...}}` — the handler is
   `@Body('values')`. Two other shapes (`{settings:[...]}`, a bare map) were
   both correctly rejected with the bilingual "Expected an object of setting
   key/value pairs" error. The validation works; the payload shape is just not
   guessable.
2. An initial grep for `--bg-page` in the served HTML returned nothing and
   looked like a serious bug (theme attribute set, no tokens). It was a wrong
   assumption in the *check*, not the code: the token is `--bg`. Verified that
   `globals.css` consumes `var(--bg)` (3 uses) and `var(--bg-page)` (0 uses), so
   emitter and consumer agree.

### Not verified

The round-trip above was driven over **HTTP**, asserting on the served HTML. It
proves the data path (CMS write → Postgres → public API → server-rendered
tokens). It does **not** prove anything about pixels.

Specifically still unverified, and not claimable from what was run:

- **No browser rendering.** No screenshots at 320/375/768/1024/1440/1920, no
  visual check of navbar, mobile menu, focus rings, or theme transitions. There
  is no browser automation available in this environment; asserting on HTML is
  the honest limit of what was possible.
- **No admin-UI click-through.** The theme was saved through the same endpoint
  the admin panel calls, with the same payload and the same auth, but the React
  Settings page itself was not driven by hand.
- **Restart persistence** was not re-tested by bouncing the processes. The value
  lives in a Postgres row that survived multiple independent HTTP reads, so this
  is low-risk, but it was not literally observed.
- **API-outage fallback** was not exercised live. It is unit-tested
  (`resolveAppearance(null)` → Solar Refined) but the site was not loaded with
  the API stopped.
- No Lighthouse run.

---

## Remaining work

In dependency order:

1. **Seed defaults** — add appearance/contact rows to `apps/api/prisma/seed.ts`
   so a fresh install has a `websiteTheme` row before an admin visits Settings.
2. **Visual pass in a real browser** — the data round-trip is done and passing
   (see "Live stack round-trip"); what remains is looking at it: all eight
   themes at 320/375/768/1024/1440/1920, plus an axe/Lighthouse run.
3. **Media 16:9** — `width`/`height`/`focalX`/`focalY` columns; dimension,
   aspect-ratio, file-size and MIME validation on upload; a crop/reposition UI
   that lets editors *crop* rather than rejecting useful images; 16:9 preview;
   responsive sizes + modern formats; video posters; bilingual validation
   errors; alt-text fields. Existing media must keep working via fallback
   (`--focal-*` already defaults to 50%/50%, so untouched rows are safe).
4. **Hero artwork** — desktop/tablet/mobile compositions derived from the logo
   geometry, plus a 1200x630 OG image. Should be built as themeable SVG driven
   by `--glow`/`--accent-*` so it works in all eight themes, with motion gated
   on `prefers-reduced-motion`. Only the source logos are in place today.
5. **Contact section** — the data layer is done and tested (`resolveContact()`
   returns ready-to-render channels); what is missing is the *component*: the
   logo, accessible icon+label pairs, `rel="noopener noreferrer"` on external
   links, and reuse of the same data in the footer.
6. **Kelvin light interaction** — 2700K / 6500K / Dark, with localized
   microcopy in `src/messages/{fa,en}.json`. Must layer over, not replace, the
   CMS theme.
7. **Section flow + responsive audit** — reorder the homepage to the pitch-deck
   order in the brief (currently Hero → Services → Projects → Clients → Stats →
   Footer; missing intro, process, team, articles, and a real contact section),
   then test 320/375/768/1024/1440/1920.

---

## Known limitations

- Themes are contrast-verified but **not visually verified**. Measured contrast
  guarantees legibility, not that a theme looks good.
- Contrast is asserted for *token pairs as declared* (text on its own
  background). It cannot catch a component that puts, say, `--text-secondary` on
  `--accent-primary`; those combinations still need a visual/axe pass.
- `src/lib/cms/appearance.ts` imports its siblings with explicit `.ts`
  extensions. This is deliberate — it lets `node:test` load the module with no
  build step or loader, and Turbopack resolves it identically (confirmed by the
  production build). If those imports are ever "tidied" back to extensionless
  `@/` aliases, `appearance.test.ts` will stop running.
- The admin Settings UI is English-only. The API returns bilingual validation
  messages (`messageFa`), but the panel currently renders only `message`.
- `getAppearance()` and `getSettings()` currently issue separate requests from
  the layout. `getGlobalSettings()` exists to collapse these but is not yet
  wired in.
