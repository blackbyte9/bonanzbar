import { isApiAuthFailure, requireApiAuth } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";
import { UserRole } from "@/prisma/enums";
import { NextResponse } from "next/server";

const ALLOWED_GET_ROLES = [UserRole.ADMIN, UserRole.ORGANIZER, UserRole.USER] as const;
const ALLOWED_PATCH_ROLES = [UserRole.ADMIN, UserRole.ORGANIZER, UserRole.USER] as const;

type RouteContext = {
    params: Promise<{ inventoryId: string }>;
};

type UpdateInventoryItemPayload = {
    itemId?: unknown;
    count?: unknown;
    package?: unknown;
    partial?: unknown;
};

function parseIntegerValue(value: unknown): number {
    if (typeof value === "number") {
        return value;
    }

    if (typeof value === "string") {
        return Number(value);
    }

    return Number.NaN;
}

function parseFloatValue(value: unknown): number {
    if (typeof value === "number") {
        return value;
    }

    if (typeof value === "string") {
        return Number(value);
    }

    return Number.NaN;
}

function parseUpdateInventoryItemPayload(payload: UpdateInventoryItemPayload): {
    itemId: number;
    count: number;
    package: number;
    partial: number | null;
} | null {
    const parsedItemId = parseIntegerValue(payload.itemId);
    const parsedCount = parseIntegerValue(payload.count);
    const parsedPackage = parseIntegerValue(payload.package);
    const parsedPartialRaw = payload.partial === null || payload.partial === undefined || payload.partial === ""
        ? null
        : parseFloatValue(payload.partial);

    if (!Number.isInteger(parsedItemId) || parsedItemId <= 0) {
        return null;
    }

    if (!Number.isInteger(parsedCount) || parsedCount < 0) {
        return null;
    }

    if (!Number.isInteger(parsedPackage) || parsedPackage < 0) {
        return null;
    }

    if (parsedPartialRaw !== null && !Number.isFinite(parsedPartialRaw)) {
        return null;
    }

    return {
        itemId: parsedItemId,
        count: parsedCount,
        package: parsedPackage,
        partial: parsedPartialRaw,
    };
}

export async function GET(request: Request, context: RouteContext) {
    const authResult = await requireApiAuth(ALLOWED_GET_ROLES);

    if (isApiAuthFailure(authResult)) {
        return authResult.response;
    }

    const { inventoryId } = await context.params;
    const parsedInventoryId = Number(inventoryId);

    if (!Number.isInteger(parsedInventoryId) || parsedInventoryId <= 0) {
        return NextResponse.json({ error: "Invalid inventory id" }, { status: 400 });
    }

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
                    inventoryDateId: parsedInventoryId,
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

    return NextResponse.json({
        items: items.map((item) => {
            const inventoryItem = item.inventoryItems[0];

            return {
                id: item.id,
                name: item.name,
                unit: item.unit,
                packageSize: item.packageSize,
                inventoryCount: inventoryItem?.count ?? null,
                inventoryPackage: inventoryItem?.package ?? null,
                inventoryPartial: inventoryItem?.partial ?? null,
                hasNoInventoryItem: !inventoryItem,
            };
        }),
    });
}

export async function PATCH(request: Request, context: RouteContext) {
    const authResult = await requireApiAuth(ALLOWED_PATCH_ROLES);

    if (isApiAuthFailure(authResult)) {
        return authResult.response;
    }

    const { inventoryId } = await context.params;
    const parsedInventoryId = Number(inventoryId);

    if (!Number.isInteger(parsedInventoryId) || parsedInventoryId <= 0) {
        return NextResponse.json({ error: "Invalid inventory id" }, { status: 400 });
    }

    const inventory = await prisma.inventoryDates.findFirst({
        where: {
            id: parsedInventoryId,
            userId: authResult.userId,
        },
        select: {
            id: true,
        },
    });

    if (!inventory) {
        return NextResponse.json({ error: "Inventory not found" }, { status: 404 });
    }

    let payload: UpdateInventoryItemPayload;

    try {
        payload = (await request.json()) as UpdateInventoryItemPayload;
    } catch {
        return NextResponse.json({ error: "Ungültiges JSON-Format" }, { status: 400 });
    }

    const parsedPayload = parseUpdateInventoryItemPayload(payload);

    if (!parsedPayload) {
        return NextResponse.json({ error: "Ungültige Eingabe" }, { status: 400 });
    }

    const item = await prisma.item.findFirst({
        where: {
            id: parsedPayload.itemId,
            isInventoryItem: true,
        },
        select: {
            id: true,
        },
    });

    if (!item) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const existingInventoryItem = await prisma.inventoryItem.findFirst({
        where: {
            itemId: parsedPayload.itemId,
            inventoryDateId: parsedInventoryId,
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
                count: parsedPayload.count,
                package: parsedPayload.package,
                partial: parsedPayload.partial,
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
                itemId: parsedPayload.itemId,
                inventoryDateId: parsedInventoryId,
                count: parsedPayload.count,
                package: parsedPayload.package,
                partial: parsedPayload.partial,
            },
            select: {
                itemId: true,
                count: true,
                package: true,
                partial: true,
            },
        });

    return NextResponse.json({
        item: {
            itemId: savedInventoryItem.itemId,
            inventoryCount: savedInventoryItem.count,
            inventoryPackage: savedInventoryItem.package,
            inventoryPartial: savedInventoryItem.partial,
            hasNoInventoryItem: false,
        },
    });
}
