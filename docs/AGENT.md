# Parto Agent Instructions

## Source of truth

Use this order: current code, `docs/CMS-CONTRACTS.md`,
`docs/HANDOFF.md`, then README. Update documentation when verified code differs.

## Architecture

- Website: Next.js in `src/`, port `3000`.
- Admin: Next.js in `parto-cms/apps/admin`, port `3003`.
- API: NestJS in `parto-cms/apps/api`, port `3006`, prefix `/api/v1`.
- Database: PostgreSQL with Prisma schema at
  `parto-cms/apps/api/prisma/schema.prisma`.
- CMS: the self-hosted Parto CMS. Sanity is obsolete and must not be
  reintroduced unless explicitly requested.

## Working rules

- Read this file and `docs/HANDOFF.md` before coding. Read
  `docs/CMS-CONTRACTS.md` for data-contract work.
- Trust code over stale prose and inspect only the scope of the current session.
- Keep Admin -> DTO -> service -> Prisma -> Public API -> Website field names
  consistent. Editable fields must not be discarded silently.
- Preserve Persian and English content and the documented localization fallbacks.
- Use Media IDs as entity sources of truth and resolve renderable public URLs in
  the API.
- Edit only the canonical Prisma schema. Validate and regenerate Prisma Client;
  never edit generated Prisma output manually.
- Do not commit secrets, runtime uploads, logs, `.next`, `dist`, or other build
  output.
- Prefer focused tests, then run applicable builds/typechecks, Prisma validation,
  `git diff --check`, and inspect the final diff.
- Record unrelated non-blocking findings in `docs/HANDOFF.md`; do not expand the
  active session.
- Stop after the requested session is complete.
