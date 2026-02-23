/*
  Warnings:

  - You are about to drop the `HrIndianLists` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "HrIndianLists";

-- CreateTable
CREATE TABLE "hrIndianLists" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hrIndianLists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hrIndianLists_email_key" ON "hrIndianLists"("email");
