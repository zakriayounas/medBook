/*
  Warnings:

  - You are about to drop the column `stripeCustomerId` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the `CustomerCard` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `CustomerCard` DROP FOREIGN KEY `CustomerCard_userId_fkey`;

-- AlterTable
ALTER TABLE `Users` DROP COLUMN `stripeCustomerId`;

-- DropTable
DROP TABLE `CustomerCard`;
