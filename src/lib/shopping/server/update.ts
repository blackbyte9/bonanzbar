import "server-only";

import prisma from "@/lib/prisma";
import { getOrCreateShoppingUnitId, upsertItemForShopping } from "@/lib/shopping/server/create";

export async function updateShoppingListEntryDb(params: {
    shoppingListId: number;
    name: string;
    count: number;
    unit: string | null;
}) {
    const shoppingUnitId = await getOrCreateShoppingUnitId(params.unit);
    const linkedItem = await upsertItemForShopping(params.name, params.unit, shoppingUnitId);

    const updatedItem = await prisma.shoppingList.updateMany({
        where: {
            id: params.shoppingListId,
            done: false,
        },
        data: {
            itemId: linkedItem.id,
            count: params.count,
            shoppingUnitId,
        },
    });

    return updatedItem.count;
}

export async function readUpdatedShoppingListEntryDb(shoppingListId: number) {
    return prisma.shoppingList.findUnique({
        where: {
            id: shoppingListId,
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

export async function markShoppingListEntryDoneDb(shoppingListId: number): Promise<number> {
    const updateResult = await prisma.shoppingList.updateMany({
        where: {
            id: shoppingListId,
            done: false,
        },
        data: {
            done: true,
            doneAt: new Date(),
        },
    });

    return updateResult.count;
}
