import { execFileSync } from 'child_process';
import { prisma } from '../config/prisma';

const migrationName = '20260930032000_add_admin_account_fields';
const requiredUserColumns = ['accountTier', 'status', 'lastActiveAt'];
const requiredTables = [
  'support_tickets',
  'system_configs',
  'global_category_templates',
  'notification_campaigns',
  'admin_contents',
];

type MigrationRow = {
  finished_at: Date | null;
  rolled_back_at: Date | null;
};

type NamedRow = {
  name: string;
};

async function repairMigrationState() {
  const rows = await prisma.$queryRawUnsafe<MigrationRow[]>(
    'SELECT finished_at, rolled_back_at FROM `_prisma_migrations` WHERE migration_name = ? ORDER BY started_at DESC LIMIT 1',
    migrationName,
  );
  const migration = rows[0];

  if (!migration || migration.finished_at || migration.rolled_back_at) return;

  const columns = await prisma.$queryRawUnsafe<NamedRow[]>(
    `SELECT COLUMN_NAME AS name
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'users'
       AND COLUMN_NAME IN (${requiredUserColumns.map(() => '?').join(', ')})`,
    ...requiredUserColumns,
  );
  const tables = await prisma.$queryRawUnsafe<NamedRow[]>(
    `SELECT TABLE_NAME AS name
     FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME IN (${requiredTables.map(() => '?').join(', ')})`,
    ...requiredTables,
  );

  const existingColumns = new Set(columns.map((row) => row.name));
  const existingTables = new Set(tables.map((row) => row.name));
  const schemaIsComplete = requiredUserColumns.every((name) => existingColumns.has(name))
    && requiredTables.every((name) => existingTables.has(name));

  if (!schemaIsComplete) {
    throw new Error(`Migration ${migrationName} failed and its schema is incomplete; refusing to mark it as applied.`);
  }

  await prisma.$disconnect();
  const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  execFileSync(npxCommand, ['prisma', 'migrate', 'resolve', '--applied', migrationName], {
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32',
  });
  console.log(`[Database repair] Marked already-present migration as applied: ${migrationName}`);
}

repairMigrationState()
  .catch((error) => {
    console.error('[Database repair] Failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
