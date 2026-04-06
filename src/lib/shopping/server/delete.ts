import "server-only";

import prisma from "@/lib/prisma";

export async function deleteShoppingListEntryDb(shoppingListId: number): Promise<number> {
    const result = await prisma.shoppingList.deleteMany({
        where: {
            id: shoppingListId,
        },
    });

    return result.count;
}
