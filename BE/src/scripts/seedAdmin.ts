import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';

const adminEmail = (process.env.ADMIN_EMAIL || 'adminplanora@gmail.com').trim().toLowerCase();
const configuredAdminPassword = process.env.ADMIN_PASSWORD?.trim();
const initialAdminPassword = configuredAdminPassword || 'Admin@123456';

async function main() {
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  const passwordHash = await bcrypt.hash(initialAdminPassword, 10);

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

  console.log(`Admin account ${existingAdmin ? 'verified' : 'created'}: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
