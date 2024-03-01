/*
  Warnings:

  - You are about to drop the column `TasksGroupId` on the `Task` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_TasksGroupId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "TasksGroupId",
ADD COLUMN     "tasksGroupId" TEXT;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_tasksGroupId_fkey" FOREIGN KEY ("tasksGroupId") REFERENCES "TasksGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
