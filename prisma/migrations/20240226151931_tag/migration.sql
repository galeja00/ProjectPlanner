/*
  Warnings:

  - The values [Middium] on the enum `Priority` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `type` on the `Tag` table. All the data in the column will be lost.
  - Made the column `color` on table `Tag` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Priority_new" AS ENUM ('Low', 'Midium', 'Heigh');
ALTER TABLE "Task" ALTER COLUMN "priority" TYPE "Priority_new" USING ("priority"::text::"Priority_new");
ALTER TYPE "Priority" RENAME TO "Priority_old";
ALTER TYPE "Priority_new" RENAME TO "Priority";
DROP TYPE "Priority_old";
COMMIT;

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "type",
ALTER COLUMN "color" SET NOT NULL;
