import 'reflect-metadata';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { BadRequestException } from '@nestjs/common';
import { MediaService, safeUploadPath } from './media.service';
import { mediaUrl } from './media.response';
import { PublicController } from '../public/public.controller';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

function mediaRecord(filename = 'image.png') {
  return {
    id: 'media-1',
    filename,
    originalName: 'image.png',
    mimeType: 'image/png',
    type: 'IMAGE',
    size: PNG.length,
    width: 1,
    height: 1,
    altText: 'Logo',
    altTextFa: null,
    uploadedBy: null,
    createdAt: new Date(),
  };
}

test('upload validates the file, persists dimensions, and returns a renderable response', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'parto-media-upload-'));
  const filename = 'image.png';
  const filePath = join(directory, filename);
  writeFileSync(filePath, PNG);
  let createData: any;
  const prisma = {
    media: {
      create: async ({ data }: any) => {
        createData = data;
        return { ...mediaRecord(filename), ...data };
      },
    },
  };
  const service = new MediaService(prisma as any);
  (service as any).uploadDir = directory;

  try {
    const response = await service.upload({
      originalname: 'logo.png',
      filename,
      mimetype: 'image/png',
      size: PNG.length,
      path: filePath,
    });
    assert.equal(createData.width, 1);
    assert.equal(createData.height, 1);
    assert.equal(response.id, 'media-1');
    assert.equal(response.mimeType, 'image/png');
    assert.match(response.url, /\/uploads\/image\.png$/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('unsupported uploads return a clear error and do not leave the staged file', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'parto-media-reject-'));
  const filePath = join(directory, 'payload.exe');
  writeFileSync(filePath, 'not media');
  let created = false;
  const service = new MediaService({
    media: { create: async () => { created = true; } },
  } as any);
  (service as any).uploadDir = directory;

  try {
    await assert.rejects(
      service.upload({
        originalname: 'payload.exe',
        filename: 'payload.exe',
        mimetype: 'application/octet-stream',
        size: 9,
        path: filePath,
      }),
      (error: unknown) => error instanceof BadRequestException && /Unsupported file type/.test(error.message),
    );
    assert.equal(created, false);
    assert.equal(existsSync(filePath), false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('public Client response includes associated media using one batched lookup', async () => {
  let mediaQueries = 0;
  const client = {
    id: 'client-1',
    slug: 'parto',
    name: 'Parto',
    logoId: 'media-1',
    coverImageId: null,
    clientServices: [],
  };
  const prisma = {
    client: {
      findMany: async () => [client],
      count: async () => 1,
    },
    media: {
      findMany: async () => {
        mediaQueries += 1;
        return [mediaRecord()];
      },
    },
  };
  const response = await new PublicController(prisma as any).getClients();

  assert.equal(response.items[0].logoId, 'media-1');
  assert.equal(response.items[0].logo?.id, 'media-1');
  assert.equal(response.items[0].logo?.altText, 'Logo');
  assert.match(response.items[0].logo?.url || '', /\/uploads\/image\.png$/);
  assert.equal(mediaQueries, 1);
});

test('public media endpoint returns the compact render contract', async () => {
  const prisma = { media: { findUnique: async () => mediaRecord() } };
  const response = await new PublicController(prisma as any).getMediaById('media-1');

  assert.deepEqual(
    Object.keys(response || {}).sort(),
    ['altText', 'altTextFa', 'filename', 'height', 'id', 'mimeType', 'url', 'width'],
  );
  assert.equal(response?.width, 1);
  assert.match(response?.url || '', /\/uploads\/image\.png$/);
});

test('media URL generation is centralized, absolute, and encodes filenames', () => {
  assert.equal(
    mediaUrl('event image.png', 'https://cms.example.com/api/v1'),
    'https://cms.example.com/uploads/event%20image.png',
  );
});

test('delete removes physical files, tolerates missing files, and rejects traversal', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'parto-media-delete-'));
  const filename = 'delete-me.png';
  const filePath = join(directory, filename);
  writeFileSync(filePath, PNG);
  let deletes = 0;
  const prisma = {
    media: {
      findUnique: async () => mediaRecord(filename),
      delete: async () => { deletes += 1; return mediaRecord(filename); },
    },
  };
  const service = new MediaService(prisma as any);
  (service as any).uploadDir = directory;

  try {
    await service.delete('media-1');
    assert.equal(existsSync(filePath), false);
    await service.delete('media-1');
    assert.equal(deletes, 2);
    assert.throws(() => safeUploadPath(directory, '../outside.txt'), BadRequestException);

    (prisma.media.findUnique as any) = async () => mediaRecord('../outside.txt');
    await assert.rejects(service.delete('media-1'), BadRequestException);
    assert.equal(deletes, 2);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
