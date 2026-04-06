import "server-only";

import prisma from "@/lib/prisma";

export async function createInventoryDb(startDate: string, userId: string) {
    return prisma.inventoryDates.create({
        data: {
            startDate,
            userId,
        },
        select: {
            id: true,
            startDate: true,
            endDate: true,
            createdAt: true,
        },
    });
}
