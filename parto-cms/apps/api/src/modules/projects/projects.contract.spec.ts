import assert from 'node:assert/strict';
import test from 'node:test';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/project.dto';
import { ProjectsService } from './projects.service';
import { PublicController } from '../public/public.controller';

const canonicalProject = {
  titleEn: 'Canonical project',
  titleFa: 'پروژه',
  slug: 'canonical-project',
  descriptionEn: 'English description',
  descriptionFa: 'توضیحات',
  thumbnailId: 'thumbnail-id',
  coverImageId: 'cover-id',
  isFeatured: false,
  status: 'PUBLISHED',
  year: 2026,
  locationEn: 'Tehran',
  locationFa: 'تهران',
  clientIds: ['client-1'],
  seoTitleEn: 'SEO title',
  seoTitleFa: 'عنوان سئو',
  seoDescEn: 'SEO description',
  seoDescFa: 'توضیحات سئو',
} as const;

test('Project DTO accepts clientIds and rejects legacy client-name fields', async () => {
  const valid = plainToInstance(CreateProjectDto, canonicalProject);
  assert.equal((await validate(valid, { whitelist: true, forbidNonWhitelisted: true })).length, 0);

  const aliased = plainToInstance(CreateProjectDto, { ...canonicalProject, clientNameEn: 'Legacy' });
  const errors = await validate(aliased, { whitelist: true, forbidNonWhitelisted: true });
  assert.ok(errors.some((error) => error.property === 'clientNameEn'));
});

function projectPrisma(onCreate?: (data: any) => void, onUpdate?: (data: any) => void) {
  return {
    project: {
      findUnique: async ({ where }: any) => where.slug ? null : { id: 'project-id', projectClients: [] },
      findFirst: async () => null,
      create: async ({ data }: any) => {
        onCreate?.(data);
        return { ...data, projectClients: data.projectClients?.createMany?.data || [] };
      },
      update: async ({ data }: any) => {
        onUpdate?.(data);
        return { ...data, projectClients: data.projectClients?.createMany?.data || [] };
      },
    },
  } as any;
}

test('create persists ProjectClient relations in the same nested write', async () => {
  let created: Record<string, unknown> | undefined;
  const service = new ProjectsService(projectPrisma((data) => { created = data; }));

  const result = await service.create({ ...canonicalProject, clientIds: ['client-1', 'client-2'] }, 'author-id');
  assert.deepEqual((created as any).projectClients, {
    createMany: { data: [{ clientId: 'client-1' }, { clientId: 'client-2' }] },
  });
  assert.deepEqual(result.clientIds, ['client-1', 'client-2']);
  assert.equal('clientIds' in created!, false);
});

test('update synchronizes selected relations atomically', async () => {
  let updated: Record<string, unknown> | undefined;
  const service = new ProjectsService(projectPrisma(undefined, (data) => { updated = data; }));

  await service.update('project-id', { clientIds: ['client-2', 'client-3'] });
  assert.deepEqual((updated as any).projectClients, {
    deleteMany: { clientId: { notIn: ['client-2', 'client-3'] } },
    createMany: {
      data: [{ clientId: 'client-2' }, { clientId: 'client-3' }],
      skipDuplicates: true,
    },
  });
});

test('explicit empty clientIds removes every stale relation', async () => {
  let updated: Record<string, unknown> | undefined;
  const service = new ProjectsService(projectPrisma(undefined, (data) => { updated = data; }));

  await service.update('project-id', { clientIds: [] });
  assert.deepEqual((updated as any).projectClients, { deleteMany: { clientId: { notIn: [] } } });
});

test('edit read exposes existing selected Client ids', async () => {
  const prisma = {
    project: {
      findUnique: async () => ({
        id: 'project-id',
        projectClients: [{ clientId: 'client-1' }, { clientId: 'client-2' }],
      }),
    },
  } as any;

  const project = await new ProjectsService(prisma).findOne('project-id');
  assert.deepEqual(project.clientIds, ['client-1', 'client-2']);
});

test('unchanged relation selection is retained and omitted clientIds preserves relations', async () => {
  const updates: Record<string, any>[] = [];
  const service = new ProjectsService(projectPrisma(undefined, (data) => updates.push(data)));

  await service.update('project-id', { clientIds: ['client-1'] });
  await service.update('project-id', { titleEn: 'Text-only edit' });
  assert.deepEqual(updates[0].projectClients.createMany, {
    data: [{ clientId: 'client-1' }],
    skipDuplicates: true,
  });
  assert.equal('projectClients' in updates[1], false);
});

test('public Project queries always hide drafts and apply canonical featured filtering', async () => {
  const findManyWhere: Record<string, unknown>[] = [];
  const findUniqueWhere: Record<string, unknown>[] = [];
  const prisma = {
    project: {
      findMany: async ({ where }: any) => { findManyWhere.push(where); return []; },
      count: async () => 0,
      findUnique: async ({ where }: any) => {
        findUniqueWhere.push(where);
        return where.slug === 'published' && where.status === 'PUBLISHED'
          ? { slug: 'published', status: 'PUBLISHED', thumbnailId: null, coverImageId: null, projectClients: [] }
          : null;
      },
    },
  } as any;
  const controller = new PublicController(prisma);

  await controller.getProjects(undefined, undefined, 'true');
  assert.deepEqual(findManyWhere[0], { status: 'PUBLISHED', isFeatured: true });
  await controller.getProjects(undefined, undefined, 'false');
  assert.deepEqual(findManyWhere[1], { status: 'PUBLISHED', isFeatured: false });
  assert.equal((await controller.getProjectBySlug('published')).status, 'PUBLISHED');
  await assert.rejects(() => controller.getProjectBySlug('draft'), NotFoundException);
  assert.deepEqual(findUniqueWhere[1], { slug: 'draft', status: 'PUBLISHED' });
});

test('public Project response exposes related clients without join wrappers', async () => {
  const client = {
    id: 'client-1', name: 'Client', englishName: 'Client', slug: 'client',
    logoId: null, coverImageId: null,
  };
  const project = {
    id: 'project-1', slug: 'published', status: 'PUBLISHED',
    thumbnailId: null, coverImageId: null,
    projectClients: [{ clientId: client.id, client }],
  };
  const prisma = {
    project: {
      findMany: async () => [project],
      count: async () => 1,
      findUnique: async () => project,
    },
  } as any;
  const controller = new PublicController(prisma);

  const list = await controller.getProjects();
  assert.deepEqual(list.items[0].clients, [{ ...client, logo: null, coverImage: null }]);
  assert.equal('projectClients' in list.items[0], false);
  const detail = await controller.getProjectBySlug('published');
  assert.deepEqual(detail.clients, [{ ...client, logo: null, coverImage: null }]);
});
