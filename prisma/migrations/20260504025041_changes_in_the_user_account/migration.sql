/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `AccountInfo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AccountInfo_userId_key" ON "AccountInfo"("userId");
