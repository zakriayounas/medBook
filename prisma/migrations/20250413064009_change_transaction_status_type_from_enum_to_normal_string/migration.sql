/*
  Warnings:

  - You are about to alter the column `status` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `Transaction` MODIFY `status` VARCHAR(191) NULL;
