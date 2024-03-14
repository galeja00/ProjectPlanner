/*
  Warnings:

  - You are about to drop the column `projectMemberId` on the `Task` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_projectMemberId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "projectMemberId";

-- CreateTable
CREATE TABLE "TaskSolver" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,

    CONSTRAINT "TaskSolver_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskSolver_taskId_memberId_key" ON "TaskSolver"("taskId", "memberId");

-- AddForeignKey
ALTER TABLE "TaskSolver" ADD CONSTRAINT "TaskSolver_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "ProjectMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskSolver" ADD CONSTRAINT "TaskSolver_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
