/*
  Warnings:

  - You are about to drop the column `addresses` on the `Doctors` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Doctors` DROP COLUMN `addresses`;

-- AlterTable
ALTER TABLE `Users` ADD COLUMN `addresses` JSON NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL;
