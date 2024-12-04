/*
  Warnings:

  - You are about to drop the column `email` on the `doctor` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `doctor` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `doctor` table. All the data in the column will be lost.
  - You are about to drop the column `profileColor` on the `doctor` table. All the data in the column will be lost.
  - You are about to drop the column `profileImage` on the `doctor` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Doctor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Doctor` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Doctor_email_key` ON `doctor`;

-- AlterTable
ALTER TABLE `doctor` DROP COLUMN `email`,
    DROP COLUMN `name`,
    DROP COLUMN `password`,
    DROP COLUMN `profileColor`,
    DROP COLUMN `profileImage`,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `role`,
    ADD COLUMN `date_of_birth` DATETIME(3) NULL,
    ADD COLUMN `gender` ENUM('MALE', 'FEMALE', 'OTHERS') NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Doctor_userId_key` ON `Doctor`(`userId`);

-- AddForeignKey
ALTER TABLE `Doctor` ADD CONSTRAINT `Doctor_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
