import { randomBytes } from 'node:crypto';

export interface SeedAccount {
  email: string;
  password: string;
  generatedPassword: boolean;
}

function account(env: NodeJS.ProcessEnv, role: 'ADMIN' | 'EDITOR', fallbackEmail: string): SeedAccount {
  const email = env[`DEFAULT_${role}_EMAIL`] || fallbackEmail;
  const configuredPassword = env[`DEFAULT_${role}_PASSWORD`];

  if (env.NODE_ENV === 'production' && !configuredPassword) {
    throw new Error(`DEFAULT_${role}_PASSWORD is required when seeding in production`);
  }

  return {
    email,
    password: configuredPassword || randomBytes(24).toString('base64url'),
    generatedPassword: !configuredPassword,
  };
}

export function resolveSeedCredentials(env: NodeJS.ProcessEnv = process.env) {
  return {
    admin: account(env, 'ADMIN', 'admin@parto.ir'),
    editor: account(env, 'EDITOR', 'editor@parto.ir'),
  };
}
