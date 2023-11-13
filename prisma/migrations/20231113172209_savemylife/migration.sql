/*
  Warnings:

  - Made the column `taskColumnId` on table `Task` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Kanban" ALTER COLUMN "boardId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "taskColumnId" SET NOT NULL;

-- AlterTable
ALTER TABLE "TaskColumn" ALTER COLUMN "numOfTasks" SET DEFAULT 0;
