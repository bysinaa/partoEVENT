# Parto CMS Canonical Contracts

## Global

The canonical data chain is:

```text
Admin -> API DTO/service -> Prisma -> Public API -> Website data layer
```

Entity and media relations use database IDs. Content status is `DRAFT`,
`IN_REVIEW`, `PUBLISHED`, or `ARCHIVED`; public content endpoints expose only
`PUBLISHED` records. Team uses `isActive`.

Website CMS reads use `cache: "no-store"`. The public API sends no-cache headers,
so an Admin save followed by a browser reload reads current content.

## Project

Canonical writable fields:

```text
slug, titleEn, titleFa, descriptionEn, descriptionFa,
thumbnailId, coverImageId, isFeatured, status, year,
locationEn, locationFa, seoTitleEn, seoTitleFa, seoDescEn, seoDescFa,
clientIds
```

`clientIds: string[]` synchronizes the `ProjectClient` relation in the same
Prisma write. Omission preserves relations; `[]` clears them. Public Project
responses expose flat `clients`, plus embedded `thumbnail` and `coverImage`.
The website maps this response directly. Former aliases such as `featured`,
`featuredImage`, `coverImage`, `clientName*`, and `description` are not accepted.

Localization uses the requested `*Fa` value with English fallback for Persian;
English uses `*En`.

## Client

Canonical fields include:

```text
slug, name, englishName, descriptionEn, descriptionFa,
logoId, coverImageId, website, locationEn, locationFa,
featured, displayOrder, status, seoTitleEn, seoTitleFa, seoDescEn, seoDescFa,
serviceIds
```

Persian/primary name is `name`; English uses `englishName` with fallback to
`name`. `serviceIds` synchronizes `ClientService`: omission preserves and `[]`
clears. Public responses retain media IDs and embed `logo`/`coverImage`.

## Service and Team

Service uses `titleEn/titleFa`, `descriptionEn/descriptionFa`, `iconId`,
`coverImageId`, `order`, and `status`. Team uses `nameEn/nameFa`,
`positionEn/positionFa`, `biographyEn/biographyFa`, `photoId`, `order`, and
`isActive`. Admin aliases such as `image`, `bioEn`, and `bioFa` are not write
contracts.

## Media

Canonical embedded public media shape:

```text
id, filename, url, mimeType, width, height, altText, altTextFa
```

Client exposes `logoId + logo` and `coverImageId + coverImage`; Project exposes
`thumbnailId + thumbnail` and `coverImageId + coverImage`; Team exposes
`photoId + photo`. Collection enrichment is batched. URLs are absolute API
`/uploads/` URLs produced by the shared media response helper.

Accepted uploads are JPG/JPEG, PNG, WebP, GIF, SVG, MP4, and WebM with matching
MIME/extension. Deletion is basename-only, traversal-safe, removes the physical
file, and tolerates an already-missing file.

## Settings

Persistence is `SiteSetting { key, value, group }`. Admin reads rows and writes
changed values with `PUT /settings/bulk` as `{ values }`. The public API returns
a flat allow-listed object. Values remain strings except documented `show*`
visibility keys, which decode to booleans.

Website identity keys are `siteName/siteNameEn`, `tagline/taglineEn`,
`description/descriptionEn`, `logo`, `email`, `phone`, `address/addressEn`, and
`instagram`. English falls back to the base Persian value. `logo` intentionally
remains a URL string because `SiteSetting` has no Media relation.

## Production security

In `NODE_ENV=production`, API configuration requires independent
`JWT_SECRET` and `JWT_REFRESH_SECRET` values of at least 32 characters and
rejects the checked-in example placeholders. Production seeding requires
environment-provided Admin and Editor passwords. Development seeding generates
random one-time passwords when they are omitted and prints only those generated
development credentials. No production credential has a known fallback.

## Final smoke contract

`npm run test:smoke` in `parto-cms/apps/api` runs against PostgreSQL and covers:

```text
authenticate
-> upload/update Media
-> create/update/publish Client and Project
-> update Settings
-> verify public Client/Project/Settings responses
-> pass Project and Settings through website mappers
-> delete test media/records
```

The test uses a unique namespace and restores/deletes every setting, record, and
file it creates.
