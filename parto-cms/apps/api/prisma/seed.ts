import { PrismaClient, UserRole } from '../generated/prisma';
import * as bcrypt from 'bcryptjs';
import { resolveSeedCredentials } from '../src/config/seed-credentials';

const prisma = new PrismaClient();

async function upsertUser(
  credentials: ReturnType<typeof resolveSeedCredentials>['admin'],
  role: UserRole,
  name: string,
) {
  const passwordHash = await bcrypt.hash(credentials.password, 12);
  const user = await prisma.user.upsert({
    where: { email: credentials.email },
    update: { passwordHash, role, isActive: true },
    create: { email: credentials.email, passwordHash, name, role, isActive: true },
  });

  console.log(`  ${name}: ${user.email}`);
  if (credentials.generatedPassword) {
    console.log(`  Generated development password: ${credentials.password}`);
  }
}

async function main() {
  console.log('Seeding Parto CMS...');
  const credentials = resolveSeedCredentials();
  await upsertUser(credentials.admin, UserRole.SUPER_ADMIN, 'Admin');
  await upsertUser(credentials.editor, UserRole.EDITOR, 'Editor');
  console.log('Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
