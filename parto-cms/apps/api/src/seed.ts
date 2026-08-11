import { PrismaClient, UserRole } from '../generated/prisma';
import * as bcrypt from 'bcryptjs';
import { resolveSeedCredentials } from './config/seed-credentials';

export async function seed() {
  const prisma = new PrismaClient();
  const credentials = resolveSeedCredentials();

  try {
    for (const [name, account, role] of [
      ['Admin', credentials.admin, UserRole.SUPER_ADMIN],
      ['Editor', credentials.editor, UserRole.EDITOR],
    ] as const) {
      const passwordHash = await bcrypt.hash(account.password, 12);
      await prisma.user.upsert({
        where: { email: account.email },
        update: { passwordHash, role, isActive: true },
        create: { email: account.email, passwordHash, name, role, isActive: true },
      });
      console.log(`${name} user ready: ${account.email}`);
      if (account.generatedPassword) console.log(`Generated development password: ${account.password}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seed().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
