/*
  Warnings:

  - You are about to drop the `ShoppingItems` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ShoppingItems";

-- CreateTable
CREATE TABLE "shoppingitems" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT,

    CONSTRAINT "shoppingitems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventorydates" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "userId" TEXT,
    "previousInventoryId" INTEGER,

    CONSTRAINT "inventorydates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "inventorydates" ADD CONSTRAINT "inventorydates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventorydates" ADD CONSTRAINT "inventorydates_previousInventoryId_fkey" FOREIGN KEY ("previousInventoryId") REFERENCES "inventorydates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
