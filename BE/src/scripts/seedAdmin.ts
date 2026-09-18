import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';

const adminEmail = (process.env.ADMIN_EMAIL || 'adminplanora@gmail.com').trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

async function main() {
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Planora Admin',
      role: 'ADMIN',
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

  console.log(`Admin account ready: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
