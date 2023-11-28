-- CreateEnum
CREATE TYPE "Complexity" AS ENUM ('Low', 'Middium', 'Heigh');

-- AlterTable
ALTER TABLE "ProjectMember" ADD COLUMN     "seniority" TEXT;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "Complexity" "Complexity",
ADD COLUMN     "estimatedHours" INTEGER,
ALTER COLUMN "taskColumnId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "skills" TEXT[];
