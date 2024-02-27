/*
  Warnings:

  - The `complexity` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `priority` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "complexity",
ADD COLUMN     "complexity" TEXT,
DROP COLUMN "priority",
ADD COLUMN     "priority" TEXT;

-- DropEnum
DROP TYPE "Complexity";

-- DropEnum
DROP TYPE "Priority";
