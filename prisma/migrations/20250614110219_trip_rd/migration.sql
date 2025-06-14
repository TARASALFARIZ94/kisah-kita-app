/*
  Warnings:

  - You are about to drop the `rundown` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `trip` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `photo` DROP FOREIGN KEY `Photo_tripId_fkey`;

-- DropForeignKey
ALTER TABLE `rundown` DROP FOREIGN KEY `Rundown_tripId_fkey`;

-- DropForeignKey
ALTER TABLE `trip` DROP FOREIGN KEY `Trip_userId_fkey`;

-- DropIndex
DROP INDEX `Photo_tripId_fkey` ON `photo`;

-- DropTable
DROP TABLE `rundown`;

-- DropTable
DROP TABLE `trip`;

-- CreateTable
CREATE TABLE `trips` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `destination` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rundowns` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tripId` INTEGER NOT NULL,
    `activityTime` DATETIME(3) NOT NULL,
    `activity` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `rundowns` ADD CONSTRAINT `rundowns_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `trips`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `trips`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
