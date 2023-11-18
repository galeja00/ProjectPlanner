/*
  Warnings:

  - Added the required column `position` to the `TaskColumn` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TaskColumn" ADD COLUMN     "position" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
