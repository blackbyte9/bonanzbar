import "server-only";

import prisma from "@/lib/prisma";

export async function readShoppingListDb() {
    return prisma.shoppingList.findMany({
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
        where: {
            done: false,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function readShoppingItemPresetsDb() {
    const items = await prisma.item.findMany({
        select: {
            name: true,
            shoppingUnit: {
                select: {
                    name: true,
                },
            },
            updatedAt: true,
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    const uniqueItemsByName = new Map<string, { name: string; defaultUnit: string | null }>();

    for (const item of items) {
        const normalizedName = item.name.trim().toLocaleLowerCase();

        if (!normalizedName || uniqueItemsByName.has(normalizedName)) {
            continue;
        }

        uniqueItemsByName.set(normalizedName, {
            name: item.name,
            defaultUnit: item.shoppingUnit?.name ?? null,
        });
    }

    return Array.from(uniqueItemsByName.values()).sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
}

export async function readShoppingUnitsDb() {
    return prisma.shoppingUnits.findMany({
        select: {
            name: true,
        },
        orderBy: {
            name: "asc",
        },
    });
}
