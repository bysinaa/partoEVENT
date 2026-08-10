import assert from 'node:assert/strict';
import test from 'node:test';
import { PublicController } from '../public/public.controller';
import { SettingsService } from './settings.service';

test('settings persistence serializes booleans and text without changing their shape', async () => {
  const writes: any[] = [];
  const prisma = {
    siteSetting: {
      upsert: (args: any) => {
        writes.push(args);
        return Promise.resolve(args);
      },
    },
    $transaction: (operations: Promise<unknown>[]) => Promise.all(operations),
  } as any;

  await new SettingsService(prisma).upsertMany({
    tagline: 'true',
    showInstagram: false,
  });

  assert.equal(writes[0].create.value, 'true');
  assert.equal(writes[0].create.group, 'general');
  assert.equal(writes[1].create.value, 'false');
  assert.equal(writes[1].create.group, 'contact');
});

test('public settings are a flat allow-listed map with only boolean keys decoded', async () => {
  const prisma = {
    siteSetting: {
      findMany: async () => [
        { key: 'siteName', value: 'Parto' },
        { key: 'tagline', value: 'true' },
        { key: 'showInstagram', value: 'false' },
        { key: 'privateToken', value: 'secret' },
      ],
    },
  } as any;

  assert.deepEqual(await new PublicController(prisma).getSettings(), {
    siteName: 'Parto',
    tagline: 'true',
    showInstagram: false,
  });
});
