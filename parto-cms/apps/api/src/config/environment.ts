const PLACEHOLDER_SECRETS = new Set([
  'change-this-to-a-secure-random-string',
  'change-this-to-another-secure-random-string',
]);

export function validateEnvironment(env: Record<string, unknown>) {
  if (env.NODE_ENV !== 'production') return env;

  for (const key of ['JWT_SECRET', 'JWT_REFRESH_SECRET']) {
    const value = env[key];
    if (typeof value !== 'string' || value.length < 32 || PLACEHOLDER_SECRETS.has(value)) {
      throw new Error(`${key} must be a non-placeholder secret of at least 32 characters in production`);
    }
  }

  return env;
}
