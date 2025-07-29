/*
  Warnings:

  - You are about to drop the `CurrStream` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CurrStream" DROP CONSTRAINT "CurrStream_streamId_fkey";

-- DropTable
DROP TABLE "CurrStream";
