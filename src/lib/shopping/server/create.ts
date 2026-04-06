import "server-only";

import prisma from "@/lib/prisma";

export async function getOrCreateShoppingUnitId(unit: string | null): Promise<number | null> {
    if (!unit) {
        return null;
    }

    const existingUnit = await prisma.shoppingUnits.findFirst({
        where: {
            name: unit,
        },
        select: {
            id: true,
        },
    });

    if (existingUnit) {
        return existingUnit.id;
    }

    const createdUnit = await prisma.shoppingUnits.create({
        data: {
            name: unit,
        },
        select: {
            id: true,
        },
    });

    return createdUnit.id;
}

export async function upsertItemForShopping(name: string, unit: string | null, shoppingUnitId: number | null): Promise<{ id: number }> {
    const existingItem = await prisma.item.findFirst({
        where: {
            name: {
                equals: name,
                mode: "insensitive",
            },
        },
        select: {
            id: true,
        },
    });

    if (existingItem) {
        await prisma.item.update({
            where: {
                id: existingItem.id,
            },
            data: {
                name,
                unit,
                shoppingUnitId,
            },
        });
        return {
            id: existingItem.id,
        };
    }

    const createdItem = await prisma.item.create({
        data: {
            name,
            unit,
            isInventoryItem: false,
            shoppingUnitId,
        },
        select: {
            id: true,
        },
    });

    return createdItem;
}

export async function createShoppingListEntryDb(params: {
    userId: string;
    name: string;
    count: number;
    unit: string | null;
}) {
    const shoppingUnitId = await getOrCreateShoppingUnitId(params.unit);
    const linkedItem = await upsertItemForShopping(params.name, params.unit, shoppingUnitId);

    return prisma.shoppingList.create({
        data: {
            itemId: linkedItem.id,
            count: params.count,
            shoppingUnitId,
            userId: params.userId,
        },
        select: {
            id: true,
            itemId: true,
            item: {
                select: {
                    name: true,
                },
            },
            count: true,
            unit: {
                select: {
                    name: true,
                },
            },
            user: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
}
