/*
  Warnings:

  - You are about to drop the column `type` on the `Issue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Issue" DROP COLUMN "type";

-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
