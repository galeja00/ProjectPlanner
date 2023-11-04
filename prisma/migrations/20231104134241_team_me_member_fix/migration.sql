/*
  Warnings:

  - A unique constraint covering the columns `[userId,teamId]` on the table `TeamMember` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "TeamMember_teamId_key";

-- DropIndex
DROP INDEX "TeamMember_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_userId_teamId_key" ON "TeamMember"("userId", "teamId");
