import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';

const adminEmail = (process.env.ADMIN_EMAIL || 'adminplanora@gmail.com').trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD?.trim() || 'Admin@123456';

export async function ensureAdminAccount() {
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Planora Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
      isVerified: true,
      passwordHash,
    },
    create: {
      name: 'Planora Admin',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      isVerified: true,
    },
  });

  await prisma.profile.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id },
  });

  await prisma.userSetting.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id },
  });

  console.log(`[Admin bootstrap] Account ${existingAdmin ? 'synchronized' : 'created'}: ${admin.email}`);
  return admin;
}
