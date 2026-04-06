import { isApiAuthFailure, requireApiAuth } from "@/lib/auth/apiAuth";
import { createShoppingListEntryDb } from "@/lib/shopping/server/create";
import { readShoppingListDb } from "@/lib/shopping/server/read";
import { UserRole } from "@/prisma/enums";
import { NextResponse } from "next/server";

const ALLOWED_GET_ROLES = [UserRole.ADMIN, UserRole.ORGANIZER, UserRole.USER, UserRole.GUEST] as const;
const ALLOWED_POST_ROLES = [UserRole.ADMIN, UserRole.ORGANIZER, UserRole.USER] as const;

type CreateShoppingItemPayload = {
    name?: unknown;
    itemName?: unknown;
    item?: {
        name?: unknown;
    } | null;
    count?: unknown;
    unit?: unknown;
};

function resolvePayloadItemName(payload: CreateShoppingItemPayload): string {
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

function parseCreateShoppingItemPayload(payload: CreateShoppingItemPayload): {
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

export async function GET() {
    const authResult = await requireApiAuth(ALLOWED_GET_ROLES);

    if (isApiAuthFailure(authResult)) {
        return authResult.response;
    }

    const shoppingList = await readShoppingListDb();

    return NextResponse.json({
        shoppingList: shoppingList.map((item) => ({
            id: item.id,
            itemId: item.itemId,
            name: item.item?.name ?? "",
            count: item.count,
            unit: item.unit?.name ?? null,
            user: {
                id: item.user?.id,
                name: item.user?.name,
            },
        })),
    });
}

export async function POST(request: Request) {
    const authResult = await requireApiAuth(ALLOWED_POST_ROLES);

    if (isApiAuthFailure(authResult)) {
        return authResult.response;
    }

    const payload = (await request.json()) as CreateShoppingItemPayload;
    const parsedPayload = parseCreateShoppingItemPayload(payload);

    if (!parsedPayload) {
        return NextResponse.json({ error: "Ungültige Eingabe" }, { status: 400 });
    }

    const item = await createShoppingListEntryDb({
        userId: authResult.userId,
        name: parsedPayload.name,
        count: parsedPayload.count,
        unit: parsedPayload.unit,
    });

    return NextResponse.json(
        {
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
        },
        { status: 201 },
    );
}
