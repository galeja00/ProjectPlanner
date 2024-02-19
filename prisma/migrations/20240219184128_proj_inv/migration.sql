/*
  Warnings:

  - A unique constraint covering the columns `[invitedUserId,projectId]` on the table `ProjectInvite` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ProjectInvite" ALTER COLUMN "displayed" SET DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "ProjectInvite_invitedUserId_projectId_key" ON "ProjectInvite"("invitedUserId", "projectId");
