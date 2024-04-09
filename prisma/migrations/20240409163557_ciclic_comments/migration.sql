/*
  Warnings:

  - Added the required column `isFirst` to the `IssueComments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IssueComments" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isFirst" BOOLEAN NOT NULL,
ADD COLUMN     "prevCommentId" TEXT;

-- AddForeignKey
ALTER TABLE "IssueComments" ADD CONSTRAINT "IssueComments_prevCommentId_fkey" FOREIGN KEY ("prevCommentId") REFERENCES "IssueComments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
