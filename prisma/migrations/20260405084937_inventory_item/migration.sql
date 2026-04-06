-- CreateTable
CREATE TABLE "inventoryitem" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "partial" DOUBLE PRECISION DEFAULT 0,
    "itemId" INTEGER NOT NULL,
    "inventoryDateId" INTEGER NOT NULL,

    CONSTRAINT "inventoryitem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT,
    "packageSize" INTEGER DEFAULT 1,
    "isInventoryItem" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "item_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "inventoryitem" ADD CONSTRAINT "inventoryitem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventoryitem" ADD CONSTRAINT "inventoryitem_inventoryDateId_fkey" FOREIGN KEY ("inventoryDateId") REFERENCES "inventorydates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
