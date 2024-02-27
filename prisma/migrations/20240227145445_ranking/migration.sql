/*
  Warnings:

  - The `complexity` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `priority` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Ranking" AS ENUM ('low', 'medium', 'heigh');

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "complexity",
ADD COLUMN     "complexity" "Ranking",
DROP COLUMN "priority",
ADD COLUMN     "priority" "Ranking";
