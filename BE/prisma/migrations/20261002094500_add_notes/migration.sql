CREATE TABLE `notes` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `text` TEXT NOT NULL,
  `done` BOOLEAN NOT NULL DEFAULT false,
  `tag` VARCHAR(191) NOT NULL DEFAULT 'Ghi chú',
  `isPinned` BOOLEAN NOT NULL DEFAULT false,
  `color` VARCHAR(191) NOT NULL DEFAULT 'white',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `notes_userId_isPinned_idx`(`userId`, `isPinned`),
  PRIMARY KEY (`id`),
  CONSTRAINT `notes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
