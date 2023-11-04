/*
  Warnings:

  - A unique constraint covering the columns `[userId,projectId]` on the table `ProjectMember` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ProjectMember_projectId_key";

-- DropIndex
DROP INDEX "ProjectMember_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_userId_projectId_key" ON "ProjectMember"("userId", "projectId");
