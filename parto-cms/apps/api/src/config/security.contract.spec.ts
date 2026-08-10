import assert from 'node:assert/strict';
import test from 'node:test';
import { validateEnvironment } from './environment';
import { resolveSeedCredentials } from './seed-credentials';

test('production requires strong non-placeholder JWT secrets', () => {
  assert.throws(() => validateEnvironment({ NODE_ENV: 'production' }), /JWT_SECRET/);
  assert.throws(() => validateEnvironment({
    NODE_ENV: 'production',
    JWT_SECRET: 'change-this-to-a-secure-random-string',
    JWT_REFRESH_SECRET: 'x'.repeat(32),
  }), /JWT_SECRET/);
  assert.doesNotThrow(() => validateEnvironment({
    NODE_ENV: 'production',
    JWT_SECRET: 'a'.repeat(32),
    JWT_REFRESH_SECRET: 'b'.repeat(32),
  }));
});

test('production seed requires environment-provided passwords', () => {
  assert.throws(() => resolveSeedCredentials({ NODE_ENV: 'production' }), /DEFAULT_ADMIN_PASSWORD/);
});

test('development seed generates unknown passwords when none are configured', () => {
  const first = resolveSeedCredentials({ NODE_ENV: 'development' });
  const second = resolveSeedCredentials({ NODE_ENV: 'development' });
  assert.equal(first.admin.generatedPassword, true);
  assert.notEqual(first.admin.password, second.admin.password);
  assert.ok(first.admin.password.length >= 32);
});
