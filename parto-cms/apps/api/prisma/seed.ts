// ============================================
// Database Seed — Initial Data for Parto CMS
// Creates admin user for the minimal schema
// ============================================

import { PrismaClient, UserRole } from '../generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Create Admin User ─────────────────────
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@parto.ir' },
    update: {},
    create: {
      email: 'admin@parto.ir',
      passwordHash: adminPassword,
      name: 'Admin',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });
  console.log(`  ✅ Admin user: ${admin.email}`);

  // ─── Create Editor User ────────────────────
  const editorPassword = await bcrypt.hash('editor123', 12);
  const editor = await prisma.user.upsert({
    where: { email: 'editor@parto.ir' },
    update: {},
    create: {
      email: 'editor@parto.ir',
      passwordHash: editorPassword,
      name: 'Editor',
      role: UserRole.EDITOR,
      isActive: true,
    },
  });
  console.log(`  ✅ Editor user: ${editor.email}`);

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('  Login credentials:');
  console.log('  ─────────────────');
  console.log('  Admin:  admin@parto.ir  / admin123');
  console.log('  Editor: editor@parto.ir / editor123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });