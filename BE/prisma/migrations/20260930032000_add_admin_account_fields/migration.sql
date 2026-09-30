-- Extend user accounts for deployed authentication and administration.
ALTER TABLE `users`
  MODIFY `role` ENUM('USER', 'ADMIN', 'CONTENT_MANAGER', 'CUSTOMER_SUPPORT', 'ENTERPRISE_LEAD') NOT NULL DEFAULT 'USER',
  ADD COLUMN `accountTier` ENUM('FREE', 'PREMIUM', 'VIP', 'INTERNAL') NOT NULL DEFAULT 'FREE',
  ADD COLUMN `status` ENUM('ACTIVE', 'LOCKED') NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN `lastActiveAt` DATETIME(3) NULL;

CREATE INDEX `users_role_idx` ON `users`(`role`);
CREATE INDEX `users_status_idx` ON `users`(`status`);
CREATE INDEX `users_accountTier_idx` ON `users`(`accountTier`);
CREATE INDEX `users_lastActiveAt_idx` ON `users`(`lastActiveAt`);

CREATE TABLE `support_tickets` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `subject` VARCHAR(191) NOT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED') NOT NULL DEFAULT 'OPEN',
  `adminReply` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `support_tickets_userId_idx`(`userId`),
  INDEX `support_tickets_status_idx`(`status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `system_configs` (
  `id` VARCHAR(191) NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  `label` VARCHAR(191) NOT NULL,
  `value` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `updatedAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `system_configs_key_key`(`key`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `global_category_templates` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `type` ENUM('STUDY', 'WORK', 'TASK', 'MEETING', 'PERSONAL', 'HABIT', 'DEADLINE') NOT NULL,
  `color` VARCHAR(191) NOT NULL DEFAULT '#4F46E5',
  `bgColor` VARCHAR(191) NOT NULL DEFAULT '#E2DFFF',
  `textColor` VARCHAR(191) NOT NULL DEFAULT '#3323CC',
  `description` TEXT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `global_category_templates_type_idx`(`type`),
  INDEX `global_category_templates_isActive_idx`(`isActive`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `notification_campaigns` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `message` TEXT NOT NULL,
  `audience` ENUM('FREE', 'PREMIUM', 'VIP', 'INTERNAL') NULL,
  `status` ENUM('DRAFT', 'SENT') NOT NULL DEFAULT 'DRAFT',
  `scheduledAt` DATETIME(3) NULL,
  `sentAt` DATETIME(3) NULL,
  `recipientsCount` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `notification_campaigns_status_idx`(`status`),
  INDEX `notification_campaigns_audience_idx`(`audience`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `admin_contents` (
  `id` VARCHAR(191) NOT NULL,
  `type` ENUM('HANDBOOK', 'HOMEPAGE', 'BANNER') NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `body` TEXT NOT NULL,
  `isPublished` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `admin_contents_type_idx`(`type`),
  INDEX `admin_contents_isPublished_idx`(`isPublished`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `support_tickets`
  ADD CONSTRAINT `support_tickets_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
