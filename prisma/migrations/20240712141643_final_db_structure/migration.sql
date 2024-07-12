/*
  Warnings:

  - You are about to drop the column `isAdmin` on the `ProjectMember` table. All the data in the column will be lost.
  - You are about to drop the `IssueComments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "IssueComments" DROP CONSTRAINT "IssueComments_authorId_fkey";

-- DropForeignKey
ALTER TABLE "IssueComments" DROP CONSTRAINT "IssueComments_issueId_fkey";

-- DropForeignKey
ALTER TABLE "IssueComments" DROP CONSTRAINT "IssueComments_prevCommentId_fkey";

-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "taskId" TEXT;

-- AlterTable
ALTER TABLE "ProjectMember" DROP COLUMN "isAdmin";

-- DropTable
DROP TABLE "IssueComments";

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
