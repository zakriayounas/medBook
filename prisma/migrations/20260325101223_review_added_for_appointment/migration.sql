-- AlterTable
ALTER TABLE `DoctorReviews` MODIFY `appointmentId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `DoctorReviews` ADD CONSTRAINT `DoctorReviews_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `Appointments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
