-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_projectMemberId_fkey";

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "description" TEXT,
ALTER COLUMN "projectMemberId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "taskId" TEXT,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectMemberId_fkey" FOREIGN KEY ("projectMemberId") REFERENCES "ProjectMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
