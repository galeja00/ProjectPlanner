/*
  Warnings:

  - You are about to drop the column `icon` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the `TeamMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProjectToTeam` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,teamId]` on the table `ProjectMember` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `projectId` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_teamId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "_ProjectToTeam" DROP CONSTRAINT "_ProjectToTeam_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProjectToTeam" DROP CONSTRAINT "_ProjectToTeam_B_fkey";

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "icon",
ADD COLUMN     "projectId" TEXT NOT NULL;

-- DropTable
DROP TABLE "TeamMember";

-- DropTable
DROP TABLE "_ProjectToTeam";

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_userId_teamId_key" ON "ProjectMember"("userId", "teamId");

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
