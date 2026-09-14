-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NULL,
    `major` VARCHAR(191) NULL,
    `university` VARCHAR(191) NULL,
    `gpa` DOUBLE NOT NULL DEFAULT 0.0,
    `completedCredits` INTEGER NOT NULL DEFAULT 0,
    `totalCredits` INTEGER NOT NULL DEFAULT 135,
    `bio` TEXT NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_settings` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `theme` ENUM('LIGHT', 'DARK', 'SYSTEM') NOT NULL DEFAULT 'LIGHT',
    `language` ENUM('VI', 'EN') NOT NULL DEFAULT 'VI',
    `emailNotifications` BOOLEAN NOT NULL DEFAULT true,
    `pushNotifications` BOOLEAN NOT NULL DEFAULT true,
    `deadlineReminderHours` INTEGER NOT NULL DEFAULT 24,
    `timetableAlerts` BOOLEAN NOT NULL DEFAULT true,
    `soundEffects` BOOLEAN NOT NULL DEFAULT false,
    `twoFactorAuth` BOOLEAN NOT NULL DEFAULT false,
    `loginAlerts` BOOLEAN NOT NULL DEFAULT true,
    `autoSaveDrafts` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_settings_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('STUDY', 'WORK', 'TASK', 'MEETING', 'PERSONAL', 'HABIT', 'DEADLINE') NOT NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT '#4F46E5',
    `bgColor` VARCHAR(191) NOT NULL DEFAULT '#E2DFFF',
    `textColor` VARCHAR(191) NOT NULL DEFAULT '#3323CC',
    `isSystem` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `categories_userId_idx`(`userId`),
    UNIQUE INDEX `categories_userId_name_type_key`(`userId`, `name`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasks` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('TODO', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE') NOT NULL DEFAULT 'TODO',
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    `dueDate` DATETIME(3) NOT NULL,
    `dueTime` VARCHAR(191) NULL,
    `courseCode` VARCHAR(191) NULL,
    `subtasksCountTotal` INTEGER NOT NULL DEFAULT 0,
    `subtasksCountCompleted` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `tasks_userId_idx`(`userId`),
    INDEX `tasks_userId_status_idx`(`userId`, `status`),
    INDEX `tasks_userId_dueDate_idx`(`userId`, `dueDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `events` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `location` VARCHAR(191) NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `isAllDay` BOOLEAN NOT NULL DEFAULT false,
    `hasConflict` BOOLEAN NOT NULL DEFAULT false,
    `recurrenceType` ENUM('NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY') NOT NULL DEFAULT 'NONE',
    `recurrenceInterval` INTEGER NOT NULL DEFAULT 1,
    `recurrenceEndDate` DATETIME(3) NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT '#4F46E5',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `events_userId_idx`(`userId`),
    INDEX `events_userId_startTime_endTime_idx`(`userId`, `startTime`, `endTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `timetables` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `termName` VARCHAR(191) NOT NULL,
    `academicYear` VARCHAR(191) NOT NULL,
    `totalCredits` INTEGER NOT NULL DEFAULT 0,
    `totalSubjects` INTEGER NOT NULL DEFAULT 0,
    `isCurrent` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `timetables_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `timetable_items` (
    `id` VARCHAR(191) NOT NULL,
    `timetableId` VARCHAR(191) NOT NULL,
    `subjectName` VARCHAR(191) NOT NULL,
    `courseCode` VARCHAR(191) NOT NULL,
    `dayOfWeek` INTEGER NOT NULL,
    `startSlot` INTEGER NOT NULL,
    `slotSpan` INTEGER NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `timeRange` VARCHAR(191) NOT NULL,
    `room` VARCHAR(191) NOT NULL,
    `lecturer` VARCHAR(191) NOT NULL,
    `type` ENUM('THEORY', 'PRACTICE', 'EXAM') NOT NULL DEFAULT 'THEORY',
    `color` VARCHAR(191) NOT NULL DEFAULT '#0058BE',
    `bgColor` VARCHAR(191) NOT NULL DEFAULT '#D8E2FF',
    `textColor` VARCHAR(191) NOT NULL DEFAULT '#001A42',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `timetable_items_timetableId_idx`(`timetableId`),
    INDEX `timetable_items_timetableId_dayOfWeek_idx`(`timetableId`, `dayOfWeek`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `habits` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `targetFrequency` INTEGER NOT NULL DEFAULT 7,
    `currentStreak` INTEGER NOT NULL DEFAULT 0,
    `bestStreak` INTEGER NOT NULL DEFAULT 0,
    `lastCompletedDate` DATE NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT '#006E4B',
    `icon` VARCHAR(191) NOT NULL DEFAULT 'flame',
    `isCompletedToday` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `habits_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `habit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `habitId` VARCHAR(191) NOT NULL,
    `completedDate` DATE NOT NULL,
    `isCompleted` BOOLEAN NOT NULL DEFAULT true,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `habit_logs_habitId_idx`(`habitId`),
    UNIQUE INDEX `habit_logs_habitId_completedDate_key`(`habitId`, `completedDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('SYSTEM', 'DEADLINE', 'TIMETABLE', 'HABIT', 'EVENT') NOT NULL DEFAULT 'SYSTEM',
    `relatedEntityType` VARCHAR(191) NULL,
    `relatedEntityId` VARCHAR(191) NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `link` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_userId_idx`(`userId`),
    INDEX `notifications_userId_isRead_idx`(`userId`, `isRead`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_settings` ADD CONSTRAINT `user_settings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `events` ADD CONSTRAINT `events_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `events` ADD CONSTRAINT `events_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `timetables` ADD CONSTRAINT `timetables_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `timetable_items` ADD CONSTRAINT `timetable_items_timetableId_fkey` FOREIGN KEY (`timetableId`) REFERENCES `timetables`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `habits` ADD CONSTRAINT `habits_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `habits` ADD CONSTRAINT `habits_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `habit_logs` ADD CONSTRAINT `habit_logs_habitId_fkey` FOREIGN KEY (`habitId`) REFERENCES `habits`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
