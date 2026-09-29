ALTER TABLE `notifications` ADD COLUMN `emailSentAt` DATETIME(3) NULL;

-- Existing notifications predate delivery tracking and must not be resent.
UPDATE `notifications` SET `emailSentAt` = `createdAt`;

