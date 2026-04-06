import "server-only";

import { calculateInventorySum } from "@/lib/inventory/sum";
import prisma from "@/lib/prisma";

export async function readActiveInventoryDb(userId: string) {
    return prisma.inventoryDates.findFirst({
        where: {
            userId,
            endDate: null,
        },
        select: {
            id: true,
            startDate: true,
            endDate: true,
        },
    });
}

export async function readInventoryByIdDb(inventoryId: number) {
    return prisma.inventoryDates.findUnique({
        where: { id: inventoryId },
        select: {
            id: true,
            startDate: true,
            endDate: true,
        },
    });
}

export async function readInventoryListDb(userId: string) {
    return prisma.inventoryDates.findMany({
        where: {
            userId,
        },
        select: {
            id: true,
            startDate: true,
            endDate: true,
            createdAt: true,
        },
        orderBy: {
            startDate: "desc",
        },
    });
}

export async function readInventoryItemsDb(inventoryId: number) {
    const items = await prisma.item.findMany({
        where: {
            isInventoryItem: true,
        },
        select: {
            id: true,
            name: true,
            unit: true,
            packageSize: true,
            inventoryItems: {
                where: {
                    inventoryDateId: inventoryId,
                },
                select: {
                    count: true,
                    package: true,
                    partial: true,
                },
                take: 1,
            },
        },
        orderBy: {
            name: "asc",
        },
    });

    return items.map((item) => {
        const inventoryItem = item.inventoryItems[0];

        return {
            id: item.id,
            name: item.name,
            unit: item.unit,
            packageSize: item.packageSize,
            inventoryCount: inventoryItem?.count ?? null,
            inventoryPackage: inventoryItem?.package ?? null,
            inventoryPartial: inventoryItem?.partial ?? null,
            inventorySum: calculateInventorySum({
                count: inventoryItem?.count,
                packageSize: item.packageSize,
                packageCount: inventoryItem?.package,
                partial: inventoryItem?.partial,
            }),
            hasNoInventoryItem: !inventoryItem,
        };
    });
}

export async function readInventoryItemsForSelectionDb() {
    return prisma.item.findMany({
        where: {
            isInventoryItem: true,
        },
        select: {
            id: true,
            name: true,
            unit: true,
            packageSize: true,
        },
        orderBy: {
            name: "asc",
        },
    });
}
