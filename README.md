# Parto

Parto is a bilingual Persian/English website backed by the self-hosted Parto CMS.
The public website reads content through the CMS public REST API; it never reads
PostgreSQL directly.

## Architecture

| Application | Technology | Path | Local port |
| --- | --- | --- | --- |
| Website | Next.js | repository root (`src/`) | `3000` |
| Admin | Next.js | `parto-cms/apps/admin` | `3003` |
| API | NestJS | `parto-cms/apps/api` | `3006` |
| Database | PostgreSQL + Prisma | `parto-cms/apps/api/prisma/schema.prisma` | `55432` on the host |

The custom Parto CMS is the only CMS. Sanity is not part of the runtime or setup.
`parto-ems` and `parto-oms` are separate applications and are outside this
website/CMS workflow.

## Prerequisites

- Node.js 20 or newer
- npm
- Docker Desktop (for the included PostgreSQL container)

## Local setup

### 1. Configure and start the CMS

From `parto-cms`:

```powershell
Copy-Item .env.example apps/api/.env
npm install
npm run docker:up
npm run db:push
npm run db:seed
npm run dev
```

On macOS/Linux, replace the first command with:

```sh
cp .env.example apps/api/.env
```

Before `db:seed`, edit `apps/api/.env`:

- Set `JWT_SECRET` and `JWT_REFRESH_SECRET` to independent random values.
- Set `DEFAULT_ADMIN_PASSWORD` and `DEFAULT_EDITOR_PASSWORD`, or leave them
  blank for local development. Blank development passwords are generated once
  and printed by the seed command.

Production startup rejects missing, short, or example JWT secrets. Production
seeding also rejects missing user passwords. Never commit `apps/api/.env`.

The CMS commands start these endpoints:

- Admin: <http://localhost:3003>
- API: <http://localhost:3006>
- Swagger: <http://localhost:3006/docs>

The included Docker Compose file publishes PostgreSQL on `55432`, Redis on
`6379`, and MinIO on `9002` (console `9003`). PostgreSQL is the CMS datastore;
local media files are served by the API from `apps/api/uploads`.

### 2. Configure and start the website

From the repository root in another terminal:

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

macOS/Linux equivalent:

```sh
cp .env.example .env.local
npm install
npm run dev
```

The website runs at <http://localhost:3000>. Its required setting is:

```dotenv
CMS_API_URL=http://localhost:3006/api/v1/api/public
```

## Database workflow

The canonical schema is `parto-cms/apps/api/prisma/schema.prisma`.

```powershell
cd parto-cms
npm run db:push
npm run db:seed
npm run db:studio
```

Local setup may use `prisma db push`. Production includes a tracked initial
migration and the API container runs `prisma migrate deploy` before startup.
Prisma Client is generated code; regenerate it with `npm run db:generate` from
`parto-cms/apps/api` and do not edit generated output manually.

## Content flow

```text
Admin -> authenticated NestJS API -> Prisma -> PostgreSQL
                                      |
Website data layer <- public API <----+
```

The API prefix is `/api/v1`. Public, unauthenticated reads are under
`/api/v1/api/public` and expose only published/active content. Website reads go
through `src/lib/cms/data.ts` with `cache: "no-store"`, so a normal reload sees
newly published CMS content.

Canonical CMS contracts and session history are documented in
`docs/CMS-CONTRACTS.md` and `docs/HANDOFF.md`.

## Verification

API and focused contracts:

```powershell
cd parto-cms/apps/api
npm test
npm run test:smoke
npm run build
npx prisma validate
npx prisma generate
```

`test:smoke` requires the local PostgreSQL container and an up-to-date schema.
It starts the Nest app on an ephemeral port, authenticates, uploads and updates
Media, creates/updates/publishes Client and Project records, updates Settings,
checks the public API and website mappers, then removes its records and file.

Admin:

```powershell
cd parto-cms/apps/admin
npm run type-check
npm run build
```

Website:

```powershell
npm test
npm run typecheck
npm run build
```

Repository hygiene:

```powershell
git diff --check
git status --short
```

## Production notes

راهنمای کامل deploy از Git روی VPS لینوکس در
[`docs/DEPLOY-VPS.md`](docs/DEPLOY-VPS.md) قرار دارد. فایل production آماده شامل
`compose.production.yml`، Caddy با HTTPS خودکار و سه Docker image مستقل است.

- Store database, JWT, seed-user, and object-storage secrets in the deployment
  environment; example values are local placeholders only.
- Set `ADMIN_URL` to the deployed Admin origin and
  `NEXT_PUBLIC_API_URL` in the Admin build to the API `/api/v1` URL.
- Set the website `CMS_API_URL` to the public API base.
- Persist or externalize `apps/api/uploads`; deleting the API filesystem removes
  locally stored media.
- Put rate limiting and normal edge protections in front of the public API.

Production is deployed with `compose.production.yml`: PostgreSQL and uploads
use named volumes, only Caddy exposes host ports, and Caddy provisions HTTPS for
the Website, Admin, and API domains. See the VPS guide before the first deploy.
The guide also provides a one-command Ubuntu/Debian installer.
