/*
  Warnings:

  - Added the required column `color` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "color" TEXT NOT NULL,
ALTER COLUMN "done" SET DEFAULT false;
