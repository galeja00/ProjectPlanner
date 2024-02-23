/*
  Warnings:

  - Added the required column `projectId` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('Low', 'Middium', 'Heigh');

-- DropForeignKey
ALTER TABLE "Scrum" DROP CONSTRAINT "Scrum_projectId_fkey";

-- DropIndex
DROP INDEX "Tag_taskId_key";

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "priority" "Priority",
ADD COLUMN     "projectId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Kanban"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;
