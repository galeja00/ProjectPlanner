/*
  Warnings:

  - You are about to drop the column `Complexity` on the `Task` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "TaskColumn_name_key";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "Complexity",
ADD COLUMN     "complexity" "Complexity";
