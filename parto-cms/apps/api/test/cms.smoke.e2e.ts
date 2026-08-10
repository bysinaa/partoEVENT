import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { UserRole } from '../generated/prisma';
import { mapProject, mapSettings } from '../../../../src/lib/cms/data';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ||= 'cms-smoke-access-secret-32-characters';
process.env.JWT_REFRESH_SECRET ||= 'cms-smoke-refresh-secret-32-characters';

test('authenticated CMS publish flow reaches the public API and website mapping', async () => {
  mkdirSync(join(process.cwd(), 'uploads'), { recursive: true });
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));
  await app.listen(0, '127.0.0.1');

  const prisma = app.get(PrismaService);
  const base = await app.getUrl();
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const email = `cms-smoke-${suffix}@example.test`;
  const password = `Smoke-${suffix}-password`;
  const slug = `cms-smoke-${suffix}`;
  const settingKey = 'siteNameEn';
  const previousSetting = await prisma.siteSetting.findUnique({ where: { key: settingKey } });
  let userId: string | undefined;
  let clientId: string | undefined;
  let projectId: string | undefined;
  let mediaId: string | undefined;
  let mediaFilename: string | undefined;

  const json = async (path: string, init: RequestInit = {}) => {
    const response = await fetch(`${base}/api/v1${path}`, init);
    const body = response.status === 204 ? null : await response.json();
    assert.ok(response.ok, `${init.method || 'GET'} ${path}: ${response.status} ${JSON.stringify(body)}`);
    return body;
  };

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name: 'CMS Smoke',
        passwordHash: await bcrypt.hash(password, 4),
        role: UserRole.SUPER_ADMIN,
      },
    });
    userId = user.id;

    const login = await json('/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const authHeaders = {
      authorization: `Bearer ${login.accessToken}`,
      'content-type': 'application/json',
    };

    const form = new FormData();
    form.append('file', new Blob([
      Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'),
    ], { type: 'image/png' }), 'smoke.png');
    const media = await json('/media/upload', {
      method: 'POST',
      headers: { authorization: `Bearer ${login.accessToken}` },
      body: form,
    });
    mediaId = media.id;
    mediaFilename = media.filename;
    const updatedMedia = await json(`/media/${media.id}`, {
      method: 'PATCH', headers: authHeaders, body: JSON.stringify({ altText: 'CMS smoke image' }),
    });
    assert.equal(updatedMedia.altText, 'CMS smoke image');

    const client = await json('/clients', {
      method: 'POST', headers: authHeaders,
      body: JSON.stringify({
        slug: `${slug}-client`, name: 'مشتری تست', englishName: 'Smoke Client',
        logoId: media.id, status: 'DRAFT',
      }),
    });
    clientId = client.id;
    const publishedClient = await json(`/clients/${client.id}`, {
      method: 'PATCH', headers: authHeaders,
      body: JSON.stringify({ englishName: 'Updated Smoke Client', status: 'PUBLISHED' }),
    });
    assert.equal(publishedClient.englishName, 'Updated Smoke Client');

    const project = await json('/projects', {
      method: 'POST', headers: authHeaders,
      body: JSON.stringify({
        slug: `${slug}-project`, titleEn: 'Smoke Project Draft', titleFa: 'پروژه تست',
        thumbnailId: media.id, clientIds: [client.id], status: 'DRAFT',
      }),
    });
    projectId = project.id;
    await json(`/projects/${project.id}`, {
      method: 'PATCH', headers: authHeaders,
      body: JSON.stringify({ titleEn: 'Published Smoke Project', isFeatured: true, status: 'PUBLISHED' }),
    });

    await json('/settings/bulk', {
      method: 'PUT', headers: authHeaders,
      body: JSON.stringify({ values: { [settingKey]: 'Parto Smoke' } }),
    });

    const publicClient = await json(`/api/public/clients/${slug}-client`);
    assert.equal(publicClient.logo.id, media.id);
    assert.equal(publicClient.logo.altText, 'CMS smoke image');

    const publicProject = await json(`/api/public/projects/${slug}-project`);
    assert.equal(publicProject.titleEn, 'Published Smoke Project');
    assert.equal(publicProject.thumbnail.id, media.id);
    assert.equal(publicProject.clients[0].id, client.id);

    const publicSettings = await json('/api/public/settings');
    assert.equal(publicSettings[settingKey], 'Parto Smoke');

    const websiteProject = mapProject(publicProject, 'en');
    assert.deepEqual({
      title: websiteProject.title,
      thumbnail: websiteProject.thumbnail?.url,
      client: websiteProject.clients[0]?.name,
    }, {
      title: 'Published Smoke Project',
      thumbnail: publicProject.thumbnail.url,
      client: 'Updated Smoke Client',
    });
    assert.equal(mapSettings(publicSettings, 'en').siteName, 'Parto Smoke');

    await json(`/media/${media.id}`, { method: 'DELETE', headers: authHeaders });
    assert.equal(existsSync(join(process.cwd(), 'uploads', media.filename)), false);
    mediaId = undefined;
  } finally {
    if (projectId) await prisma.project.deleteMany({ where: { id: projectId } });
    if (clientId) await prisma.client.deleteMany({ where: { id: clientId } });
    if (mediaId) {
      await prisma.media.deleteMany({ where: { id: mediaId } });
    }
    if (mediaFilename) rmSync(join(process.cwd(), 'uploads', mediaFilename), { force: true });
    if (previousSetting) {
      await prisma.siteSetting.upsert({ where: { key: settingKey }, create: previousSetting, update: previousSetting });
    } else {
      await prisma.siteSetting.deleteMany({ where: { key: settingKey } });
    }
    if (userId) {
      await prisma.refreshToken.deleteMany({ where: { userId } });
      await prisma.activityLog.deleteMany({ where: { userId } });
      await prisma.user.deleteMany({ where: { id: userId } });
    }
    await app.close();
  }
});
