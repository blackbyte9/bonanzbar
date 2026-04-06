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

export async function completeInventoryDb(inventoryId: number, userId: string) {
    const inventory = await prisma.inventoryDates.findFirst({
        where: {
            id: inventoryId,
            userId,
        },
        select: {
            id: true,
            endDate: true,
        },
    });

    if (!inventory) {
        return { kind: "inventory-not-found" as const };
    }

    if (inventory.endDate !== null) {
        return { kind: "already-completed" as const };
    }

    const today = new Date().toISOString().slice(0, 10);

    const updated = await prisma.inventoryDates.update({
        where: { id: inventoryId },
        data: { endDate: today },
        select: { id: true, endDate: true },
    });

    return { kind: "ok" as const, inventory: updated };
}
