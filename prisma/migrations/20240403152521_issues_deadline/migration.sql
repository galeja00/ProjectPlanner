/*
  Warnings:

  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `creatorId` to the `Issue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priority` to the `Issue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorId` to the `IssueComments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `IssueComments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "creatorId" TEXT NOT NULL,
ADD COLUMN     "priority" "Ranking" NOT NULL;

-- AlterTable
ALTER TABLE "IssueComments" ADD COLUMN     "authorId" TEXT NOT NULL,
ADD COLUMN     "text" TEXT NOT NULL;

-- DropTable
DROP TABLE "Profile";

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueComments" ADD CONSTRAINT "IssueComments_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueComments" ADD CONSTRAINT "IssueComments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
