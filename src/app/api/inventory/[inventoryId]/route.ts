import { isApiAuthFailure, requireApiAuth } from "@/lib/auth/apiAuth";
import { readInventoryByIdDb, readInventoryItemsDb } from "@/lib/inventory/server/read";
import { completeInventoryDb, upsertInventoryItemValuesDb } from "@/lib/inventory/server/update";
import { calculateInventorySum } from "@/lib/inventory/sum";
import { UserRole } from "@/prisma/enums";
import { NextResponse } from "next/server";

const ALLOWED_GET_ROLES = [UserRole.ADMIN, UserRole.ORGANIZER, UserRole.USER] as const;
const ALLOWED_PATCH_ROLES = [UserRole.ADMIN, UserRole.ORGANIZER, UserRole.USER] as const;
const ALLOWED_POST_ROLES = [UserRole.ADMIN, UserRole.ORGANIZER] as const;

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

    const [inventory, items] = await Promise.all([
        readInventoryByIdDb(parsedInventoryId),
        readInventoryItemsDb(parsedInventoryId),
    ]);

    return NextResponse.json({
        inventory: inventory
            ? { id: inventory.id, startDate: inventory.startDate, endDate: inventory.endDate }
            : null,
        items,
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

    const updateResult = await upsertInventoryItemValuesDb({
        inventoryId: parsedInventoryId,
        userId: authResult.userId,
        itemId: parsedPayload.itemId,
        count: parsedPayload.count,
        package: parsedPayload.package,
        partial: parsedPayload.partial,
    });

    if (updateResult.kind === "inventory-not-found") {
        return NextResponse.json({ error: "Inventory not found" }, { status: 404 });
    }

    if (updateResult.kind === "item-not-found") {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const { savedInventoryItem } = updateResult;

    return NextResponse.json({
        item: {
            itemId: savedInventoryItem.itemId,
            inventoryCount: savedInventoryItem.count,
            inventoryPackage: savedInventoryItem.package,
            inventoryPartial: savedInventoryItem.partial,
            inventorySum: calculateInventorySum({
                count: savedInventoryItem.count,
                packageSize: updateResult.packageSize,
                packageCount: savedInventoryItem.package,
                partial: savedInventoryItem.partial,
            }),
            hasNoInventoryItem: false,
        },
    });
}

export async function POST(_request: Request, context: RouteContext) {
    const authResult = await requireApiAuth(ALLOWED_POST_ROLES);

    if (isApiAuthFailure(authResult)) {
        return authResult.response;
    }

    const { inventoryId } = await context.params;
    const parsedInventoryId = Number(inventoryId);

    if (!Number.isInteger(parsedInventoryId) || parsedInventoryId <= 0) {
        return NextResponse.json({ error: "Invalid inventory id" }, { status: 400 });
    }

    const result = await completeInventoryDb(parsedInventoryId, authResult.userId);

    if (result.kind === "inventory-not-found") {
        return NextResponse.json({ error: "Inventory not found" }, { status: 404 });
    }

    if (result.kind === "already-completed") {
        return NextResponse.json({ error: "Inventory already completed" }, { status: 409 });
    }

    return NextResponse.json({ endDate: result.inventory.endDate });
}
