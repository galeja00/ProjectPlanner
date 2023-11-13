/*
  Warnings:

  - The required column `id` was added to the `ProjectMember` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `TeamMember` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "ProjectMember" ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "position" TEXT,
ADD CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "position" TEXT,
ADD CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Board" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskColumn" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "numOfTasks" INTEGER NOT NULL,

    CONSTRAINT "TaskColumn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "taskColumnId" TEXT,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "projectMemberId" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "color" TEXT,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeTable" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "TimeTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Backlog" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Backlog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectPosition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ProjectPosition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Board_projectId_key" ON "Board"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskColumn_name_key" ON "TaskColumn"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_taskId_key" ON "Tag"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "TimeTable_projectId_key" ON "TimeTable"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Backlog_projectId_key" ON "Backlog"("projectId");

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Kanban"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskColumn" ADD CONSTRAINT "TaskColumn_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_taskColumnId_fkey" FOREIGN KEY ("taskColumnId") REFERENCES "TaskColumn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectMemberId_fkey" FOREIGN KEY ("projectMemberId") REFERENCES "ProjectMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeTable" ADD CONSTRAINT "TimeTable_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Kanban"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Backlog" ADD CONSTRAINT "Backlog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Kanban"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;
