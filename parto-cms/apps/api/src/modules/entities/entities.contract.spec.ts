import assert from 'node:assert/strict';
import test from 'node:test';
import { ClientsService } from './clients.service';
import { ServicesService } from './services.service';
import { TeamService } from './team.service';

test('Client unchanged edit preserves media IDs and Service selections', async () => {
  const existing = {
    id: 'client-1',
    name: 'نام فارسی',
    englishName: 'English name',
    logoId: 'logo-1',
    coverImageId: 'cover-1',
    clientServices: [{ serviceId: 'service-1' }, { serviceId: 'service-2' }],
    projectClients: [],
  };
  let updated: Record<string, unknown> | undefined;
  let deleted = 0;
  let relations: { clientId: string; serviceId: string }[] = [];
  const prisma = {
    client: {
      findUnique: async () => existing,
      update: async ({ data }: any) => { updated = data; return existing; },
    },
    clientService: {
      deleteMany: async () => { deleted += 1; },
      createMany: async ({ data }: any) => { relations = data; },
    },
  } as any;

  const service = new ClientsService(prisma);
  const loaded = await service.findOne(existing.id);
  assert.deepEqual(loaded.serviceIds, ['service-1', 'service-2']);

  await service.update(existing.id, {
    name: existing.name,
    englishName: existing.englishName,
    logoId: existing.logoId,
    coverImageId: existing.coverImageId,
    serviceIds: loaded.serviceIds,
  });

  assert.equal(updated?.logoId, 'logo-1');
  assert.equal(updated?.coverImageId, 'cover-1');
  assert.equal(deleted, 1);
  assert.deepEqual(relations, [
    { clientId: 'client-1', serviceId: 'service-1' },
    { clientId: 'client-1', serviceId: 'service-2' },
  ]);
});

test('Client relations are preserved when omitted and cleared by an explicit empty serviceIds', async () => {
  const existing = { id: 'client-1', clientServices: [{ serviceId: 'service-1' }], projectClients: [] };
  let deleted = 0;
  let created = 0;
  const prisma = {
    client: {
      findUnique: async () => existing,
      update: async () => existing,
    },
    clientService: {
      deleteMany: async () => { deleted += 1; },
      createMany: async () => { created += 1; },
    },
  } as any;
  const service = new ClientsService(prisma);

  await service.update(existing.id, { name: 'unchanged' });
  assert.equal(deleted, 0);
  await service.update(existing.id, { serviceIds: [] });
  assert.equal(deleted, 1);
  assert.equal(created, 0);
});

test('Service create/edit round-trip uses localized canonical fields and media IDs', async () => {
  let created: Record<string, unknown> | undefined;
  let updated: Record<string, unknown> | undefined;
  const entity = { id: 'service-1', titleEn: 'Design', titleFa: 'طراحی' };
  const prisma = {
    service: {
      findUnique: async ({ where }: any) => where.slug ? null : entity,
      create: async ({ data }: any) => { created = data; return data; },
      update: async ({ data }: any) => { updated = data; return data; },
    },
  } as any;
  const service = new ServicesService(prisma);
  const payload = {
    slug: 'design', titleEn: 'Design', titleFa: 'طراحی',
    descriptionEn: 'English', descriptionFa: 'فارسی',
    iconId: 'icon-1', coverImageId: 'cover-1', image: 'obsolete-alias',
  };

  await service.create(payload);
  await service.update(entity.id, payload);
  const canonical = { ...payload } as Record<string, unknown>;
  delete canonical.image;
  assert.deepEqual(created, canonical);
  assert.deepEqual(updated, canonical);
});

test('Team create/edit round-trip preserves localized biographies and photoId', async () => {
  let created: Record<string, unknown> | undefined;
  let updated: Record<string, unknown> | undefined;
  const entity = { id: 'member-1', nameEn: 'Member', nameFa: 'عضو' };
  const prisma = {
    teamMember: {
      findUnique: async () => entity,
      create: async ({ data }: any) => { created = data; return data; },
      update: async ({ data }: any) => { updated = data; return data; },
    },
  } as any;
  const service = new TeamService(prisma);
  const payload = {
    nameEn: 'Member', nameFa: 'عضو', positionEn: 'Lead', positionFa: 'مدیر',
    biographyEn: 'English bio', biographyFa: 'زندگینامه', photoId: 'photo-1',
    bioEn: 'obsolete alias', image: 'obsolete alias', isActive: true,
  };

  await service.create(payload);
  await service.update(entity.id, payload);
  const canonical = { ...payload } as Record<string, unknown>;
  delete canonical.bioEn;
  delete canonical.image;
  assert.deepEqual(created, canonical);
  assert.deepEqual(updated, canonical);
});
