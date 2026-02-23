/*
  Warnings:

  - You are about to drop the column `applicationDate` on the `jobApplications` table. All the data in the column will be lost.
  - Added the required column `date` to the `jobApplications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "jobApplications" DROP COLUMN "applicationDate",
ADD COLUMN     "date" TEXT NOT NULL;
