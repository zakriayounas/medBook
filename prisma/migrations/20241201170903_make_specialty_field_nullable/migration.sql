/*
  Warnings:

  - You are about to drop the column `patentId` on the `appointment` table. All the data in the column will be lost.
  - Added the required column `patientId` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `appointment` DROP FOREIGN KEY `Appointment_patentId_fkey`;

-- AlterTable
ALTER TABLE `appointment` DROP COLUMN `patentId`,
    ADD COLUMN `patientId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
