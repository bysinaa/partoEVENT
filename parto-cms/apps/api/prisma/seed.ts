// ============================================
// Database Seed — Initial Data for Parto CMS
// Creates admin user for the minimal schema
// ============================================

import { PrismaClient, UserRole } from '../generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Credentials are overridable via env so real deployments never use the defaults.
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL ?? 'admin@parto.ir';
  const adminPlain = process.env.DEFAULT_ADMIN_PASSWORD ?? 'AdminPassword2026';
  const editorEmail = process.env.DEFAULT_EDITOR_EMAIL ?? 'editor@parto.ir';
  const editorPlain = process.env.DEFAULT_EDITOR_PASSWORD ?? 'EditorPassword2026';

  // ─── Create Admin User ─────────────────────
  // `update` re-applies the password hash so re-running the seed reliably
  // restores known credentials instead of silently keeping a stale password.
  const adminPassword = await bcrypt.hash(adminPlain, 12);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: adminPassword, role: UserRole.SUPER_ADMIN, isActive: true },
    create: {
      email: adminEmail,
      passwordHash: adminPassword,
      name: 'Admin',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });
  console.log(`  ✅ Admin user: ${admin.email}`);

  // ─── Create Editor User ────────────────────
  const editorPassword = await bcrypt.hash(editorPlain, 12);
  const editor = await prisma.user.upsert({
    where: { email: editorEmail },
    update: { passwordHash: editorPassword, role: UserRole.EDITOR, isActive: true },
    create: {
      email: editorEmail,
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
  console.log(`  Admin:  ${adminEmail}  / ${adminPlain}`);
  console.log(`  Editor: ${editorEmail} / ${editorPlain}`);
  console.log('\n  ⚠️  Change these before deploying anywhere non-local.');

}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });