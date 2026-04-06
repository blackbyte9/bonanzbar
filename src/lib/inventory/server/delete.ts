import "server-only";

import prisma from "@/lib/prisma";

export async function deleteInventoryDb(inventoryId: number, userId: string): Promise<number> {
    const result = await prisma.inventoryDates.deleteMany({
        where: {
            id: inventoryId,
            userId,
        },
    });

    return result.count;
}
