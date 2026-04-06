import "server-only";

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
            createdAt: "desc",
        },
    });
}

export async function readInventoryItemsDb(inventoryId: number) {
    return prisma.item.findMany({
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
