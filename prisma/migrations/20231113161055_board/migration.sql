/*
  Warnings:

  - Added the required column `boardId` to the `Kanban` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Board" ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Kanban" ADD COLUMN     "backlogId" TEXT,
ADD COLUMN     "boardId" TEXT NOT NULL,
ADD COLUMN     "timetableId" TEXT;
