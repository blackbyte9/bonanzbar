-- AlterTable
ALTER TABLE "item" ADD COLUMN "shoppingUnitId" INTEGER;

-- Backfill missing Items from historical shopping presets
INSERT INTO "item" ("createdAt", "updatedAt", "name", "unit", "isInventoryItem", "shoppingUnitId")
SELECT
    s."createdAt",
    s."updatedAt",
    s."name",
    s."unit",
    false,
    u."id"
FROM "shoppingitems" s
LEFT JOIN "shoppingunits" u ON u."name" = s."unit"
WHERE NOT EXISTS (
    SELECT 1
    FROM "item" i
    WHERE LOWER(TRIM(i."name")) = LOWER(TRIM(s."name"))
);

-- Prefer the most recently used shopping unit when an Item has no default yet
UPDATE "item" i
SET "shoppingUnitId" = u."id"
FROM (
    SELECT DISTINCT ON (LOWER(TRIM(s."name")))
        LOWER(TRIM(s."name")) AS normalized_name,
        s."unit"
    FROM "shoppingitems" s
    WHERE TRIM(s."name") <> ''
    ORDER BY LOWER(TRIM(s."name")), s."updatedAt" DESC
) latest
LEFT JOIN "shoppingunits" u ON u."name" = latest."unit"
WHERE LOWER(TRIM(i."name")) = latest.normalized_name
  AND i."shoppingUnitId" IS NULL;

-- Ensure legacy Item.unit values exist as ShoppingUnits
INSERT INTO "shoppingunits" ("createdAt", "updatedAt", "name", "shortName")
SELECT
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        DISTINCT_UNITS."name",
        NULL
FROM (
        SELECT DISTINCT TRIM(i."unit") AS "name"
        FROM "item" i
        WHERE i."unit" IS NOT NULL
            AND TRIM(i."unit") <> ''
) DISTINCT_UNITS
WHERE NOT EXISTS (
        SELECT 1
        FROM "shoppingunits" u
        WHERE LOWER(TRIM(u."name")) = LOWER(DISTINCT_UNITS."name")
);

-- Backfill shoppingUnitId from Item.unit when still missing
UPDATE "item" i
SET "shoppingUnitId" = u."id"
FROM "shoppingunits" u
WHERE i."shoppingUnitId" IS NULL
    AND i."unit" IS NOT NULL
    AND TRIM(i."unit") <> ''
    AND LOWER(TRIM(u."name")) = LOWER(TRIM(i."unit"));

-- CreateIndex
CREATE INDEX "item_shoppingUnitId_idx" ON "item"("shoppingUnitId");

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_shoppingUnitId_fkey" FOREIGN KEY ("shoppingUnitId") REFERENCES "shoppingunits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DropTable
DROP TABLE "shoppingitems";
