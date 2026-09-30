import { prisma } from '../config/prisma';
import { ensureAdminAccount } from '../services/adminBootstrap';

async function main() {
  await ensureAdminAccount();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
