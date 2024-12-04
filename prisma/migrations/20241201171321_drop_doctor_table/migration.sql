/*
  Warnings:

  - You are about to drop the column `doctorId` on the `appointment` table. All the data in the column will be lost.
  - You are about to drop the `doctor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `appointment` DROP FOREIGN KEY `Appointment_doctorId_fkey`;

-- DropForeignKey
ALTER TABLE `doctor` DROP FOREIGN KEY `Doctor_specialtyId_fkey`;

-- AlterTable
ALTER TABLE `appointment` DROP COLUMN `doctorId`;

-- DropTable
DROP TABLE `doctor`;
