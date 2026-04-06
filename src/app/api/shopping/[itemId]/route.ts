import { isApiAuthFailure, requireApiAuth } from "@/lib/auth/apiAuth";
import { readUpdatedShoppingListEntryDb, updateShoppingListEntryDb } from "@/lib/shopping/server/update";
import { UserRole } from "@/prisma/enums";
import { NextResponse } from "next/server";

const ALLOWED_PATCH_ROLES = [UserRole.ADMIN, UserRole.ORGANIZER, UserRole.USER] as const;

type RouteContext = {
    params: Promise<{ itemId: string }>;
};

type UpdateShoppingItemPayload = {
    name?: unknown;
    itemName?: unknown;
    item?: {
        name?: unknown;
    } | null;
    count?: unknown;
    unit?: unknown;
};

function resolvePayloadItemName(payload: UpdateShoppingItemPayload): string {
    const directName = typeof payload.name === "string" ? payload.name.trim() : "";

    if (directName) {
        return directName;
    }

    const explicitItemName = typeof payload.itemName === "string" ? payload.itemName.trim() : "";

    if (explicitItemName) {
        return explicitItemName;
    }

    const relationName = typeof payload.item?.name === "string" ? payload.item.name.trim() : "";

    if (relationName) {
        return relationName;
    }

    return "";
}

function parseUpdateShoppingItemPayload(payload: UpdateShoppingItemPayload): {
    name: string;
    count: number;
    unit: string | null;
} | null {
    const name = resolvePayloadItemName(payload);
    const parsedCount =
        typeof payload.count === "number"
            ? payload.count
            : typeof payload.count === "string"
                ? Number(payload.count)
                : Number.NaN;
    const unit = typeof payload.unit === "string" ? payload.unit.trim() : "";

    if (!name) {
        return null;
    }

    if (!Number.isFinite(parsedCount) || parsedCount < 0 || !Number.isInteger(parsedCount)) {
        return null;
    }

    return {
        name,
        count: parsedCount,
        unit: unit || null,
    };
}

export async function PATCH(request: Request, context: RouteContext) {
    const authResult = await requireApiAuth(ALLOWED_PATCH_ROLES);

    if (isApiAuthFailure(authResult)) {
        return authResult.response;
    }

    const { itemId } = await context.params;
    const parsedItemId = Number(itemId);

    if (!Number.isInteger(parsedItemId) || parsedItemId <= 0) {
        return NextResponse.json({ error: "Invalid shopping item id" }, { status: 400 });
    }

    const payload = (await request.json()) as UpdateShoppingItemPayload;
    const parsedPayload = parseUpdateShoppingItemPayload(payload);

    if (!parsedPayload) {
        return NextResponse.json({ error: "Ungültige Eingabe" }, { status: 400 });
    }

    const updatedCount = await updateShoppingListEntryDb({
        shoppingListId: parsedItemId,
        name: parsedPayload.name,
        count: parsedPayload.count,
        unit: parsedPayload.unit,
    });

    if (updatedCount === 0) {
        return NextResponse.json({ error: "Shopping item not found" }, { status: 404 });
    }

    const item = await readUpdatedShoppingListEntryDb(parsedItemId);

    if (!item) {
        return NextResponse.json({ error: "Shopping item not found" }, { status: 404 });
    }

    return NextResponse.json({
        item: {
            id: item.id,
            itemId: item.itemId,
            name: item.item?.name ?? "",
            count: item.count,
            unit: item.unit?.name ?? null,
            user: {
                id: item.user?.id,
                name: item.user?.name,
            },
        },
    });
}
