-- AlterTable
ALTER TABLE `Doctors` ADD COLUMN `ratingAverage` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `totalReviews` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `DoctorReviews` (
    `id` VARCHAR(191) NOT NULL,
    `doctorId` INTEGER NOT NULL,
    `patientId` INTEGER NOT NULL,
    `appointmentId` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `rating` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DoctorReviews_patientId_appointmentId_key`(`patientId`, `appointmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DoctorReviews` ADD CONSTRAINT `DoctorReviews_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `Doctors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DoctorReviews` ADD CONSTRAINT `DoctorReviews_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
