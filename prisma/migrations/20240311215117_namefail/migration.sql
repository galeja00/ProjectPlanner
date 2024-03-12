/*
  Warnings:

  - The values [heigh] on the enum `Ranking` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Ranking_new" AS ENUM ('low', 'medium', 'high');
ALTER TABLE "Task" ALTER COLUMN "priority" TYPE "Ranking_new" USING ("priority"::text::"Ranking_new");
ALTER TABLE "Task" ALTER COLUMN "complexity" TYPE "Ranking_new" USING ("complexity"::text::"Ranking_new");
ALTER TYPE "Ranking" RENAME TO "Ranking_old";
ALTER TYPE "Ranking_new" RENAME TO "Ranking";
DROP TYPE "Ranking_old";
COMMIT;
