import { Prisma } from '../../../generated/prisma';

export const publicMediaSelect = {
  id: true,
  filename: true,
  mimeType: true,
  width: true,
  height: true,
  altText: true,
  altTextFa: true,
} satisfies Prisma.MediaSelect;

export type PublicMediaRecord = Prisma.MediaGetPayload<{
  select: typeof publicMediaSelect;
}>;

export function mediaUrl(filename: string, apiUrl = process.env.API_URL): string {
  const origin = (apiUrl || `http://localhost:${process.env.API_PORT || '3006'}`)
    .replace(/\/+$/, '')
    .replace(/\/api\/v1(?:\/.*)?$/, '');
  return `${origin}/uploads/${encodeURIComponent(filename)}`;
}

export function toPublicMedia(media: PublicMediaRecord | null) {
  if (!media) return null;
  return {
    id: media.id,
    filename: media.filename,
    url: mediaUrl(media.filename),
    mimeType: media.mimeType,
    width: media.width,
    height: media.height,
    altText: media.altText,
    altTextFa: media.altTextFa,
  };
}
