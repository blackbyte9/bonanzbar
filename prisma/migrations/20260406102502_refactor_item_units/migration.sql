/*
  Warnings:

  - You are about to drop the column `name` on the `shoppinglist` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `shoppinglist` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "item_shoppingUnitId_idx";

-- AlterTable
ALTER TABLE "shoppinglist" DROP COLUMN "name",
DROP COLUMN "unit",
ADD COLUMN     "itemId" INTEGER,
ADD COLUMN     "shoppingUnitId" INTEGER;

-- AddForeignKey
ALTER TABLE "shoppinglist" ADD CONSTRAINT "shoppinglist_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shoppinglist" ADD CONSTRAINT "shoppinglist_shoppingUnitId_fkey" FOREIGN KEY ("shoppingUnitId") REFERENCES "shoppingunits"("id") ON DELETE SET NULL ON UPDATE CASCADE;
