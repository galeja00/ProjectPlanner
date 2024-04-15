-- AlterTable
ALTER TABLE "TasksGroup" ADD COLUMN     "deadlineAt" TIMESTAMP(3),
ADD COLUMN     "startAt" TIMESTAMP(3),
ADD COLUMN     "timeTableId" TEXT;

-- AddForeignKey
ALTER TABLE "TasksGroup" ADD CONSTRAINT "TasksGroup_timeTableId_fkey" FOREIGN KEY ("timeTableId") REFERENCES "TimeTable"("id") ON DELETE SET NULL ON UPDATE CASCADE;
