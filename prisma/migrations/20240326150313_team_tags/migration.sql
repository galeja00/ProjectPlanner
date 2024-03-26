-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "teamId" TEXT,
ALTER COLUMN "taskId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "color" TEXT;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
