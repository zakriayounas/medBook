-- AlterTable
ALTER TABLE `Appointments` ADD COLUMN `canceledByUserId` INTEGER NULL,
    ADD COLUMN `cancellationReason` TEXT NULL,
    ADD COLUMN `completedByUserId` INTEGER NULL,
    ADD COLUMN `completionSummary` TEXT NULL;
