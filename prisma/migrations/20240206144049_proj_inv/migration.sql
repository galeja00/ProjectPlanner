/*
  Warnings:

  - You are about to drop the `UserNotification` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `displayed` to the `ProjectInvite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProjectInvite" ADD COLUMN     "displayed" BOOLEAN NOT NULL;

-- DropTable
DROP TABLE "UserNotification";

-- DropEnum
DROP TYPE "NotificationTypes";
