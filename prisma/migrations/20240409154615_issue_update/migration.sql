/*
  Warnings:

  - You are about to drop the `ProjectPosition` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `Issue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "ProjectPosition";
