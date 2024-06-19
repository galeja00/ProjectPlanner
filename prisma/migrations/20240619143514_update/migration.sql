/*
  Warnings:

  - You are about to drop the column `name` on the `Board` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `ProjectMember` table. All the data in the column will be lost.
  - You are about to drop the column `seniority` on the `ProjectMember` table. All the data in the column will be lost.
  - You are about to drop the column `deadlineAt` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Board" DROP COLUMN "name";

-- AlterTable
ALTER TABLE "ProjectMember" DROP COLUMN "position",
DROP COLUMN "seniority";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "deadlineAt";
