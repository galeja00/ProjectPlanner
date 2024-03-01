/*
  Warnings:

  - You are about to drop the column `type` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `numOfTasks` on the `TaskColumn` table. All the data in the column will be lost.
  - You are about to drop the `Scrum` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[boardId,name]` on the table `TaskColumn` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "type",
ADD COLUMN     "doneAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "TasksGroupId" TEXT;

-- AlterTable
ALTER TABLE "TaskColumn" DROP COLUMN "numOfTasks";

-- DropTable
DROP TABLE "Scrum";

-- DropEnum
DROP TYPE "ProjectType";

-- CreateTable
CREATE TABLE "IssueComments" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,

    CONSTRAINT "IssueComments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TasksGroup" (
    "id" TEXT NOT NULL,
    "backlogId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "position" INTEGER NOT NULL,

    CONSTRAINT "TasksGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TasksGroup_backlogId_name_key" ON "TasksGroup"("backlogId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "TaskColumn_boardId_name_key" ON "TaskColumn"("boardId", "name");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_TasksGroupId_fkey" FOREIGN KEY ("TasksGroupId") REFERENCES "TasksGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TasksGroup" ADD CONSTRAINT "TasksGroup_backlogId_fkey" FOREIGN KEY ("backlogId") REFERENCES "Backlog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
