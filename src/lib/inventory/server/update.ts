import "server-only";

import prisma from "@/lib/prisma";

export async function upsertInventoryItemValuesDb(params: {
    inventoryId: number;
    userId: string;
    itemId: number;
    count: number;
    package: number;
    partial: number | null;
}) {
    const inventory = await prisma.inventoryDates.findFirst({
        where: {
            id: params.inventoryId,
            userId: params.userId,
        },
        select: {
            id: true,
        },
    });

    if (!inventory) {
        return { kind: "inventory-not-found" as const };
    }

    const item = await prisma.item.findFirst({
        where: {
            id: params.itemId,
            isInventoryItem: true,
        },
        select: {
            id: true,
        },
    });

    if (!item) {
        return { kind: "item-not-found" as const };
    }

    const existingInventoryItem = await prisma.inventoryItem.findFirst({
        where: {
            itemId: params.itemId,
            inventoryDateId: params.inventoryId,
        },
        select: {
            id: true,
        },
    });

    const savedInventoryItem = existingInventoryItem
        ? await prisma.inventoryItem.update({
            where: {
                id: existingInventoryItem.id,
            },
            data: {
                count: params.count,
                package: params.package,
                partial: params.partial,
            },
            select: {
                itemId: true,
                count: true,
                package: true,
                partial: true,
            },
        })
        : await prisma.inventoryItem.create({
            data: {
                itemId: params.itemId,
                inventoryDateId: params.inventoryId,
                count: params.count,
                package: params.package,
                partial: params.partial,
            },
            select: {
                itemId: true,
                count: true,
                package: true,
                partial: true,
            },
        });

    return {
        kind: "ok" as const,
        savedInventoryItem,
    };
}
