import { isApiAuthFailure, requireApiAuth } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";
import { UserRole } from "@/prisma/enums";
import { NextResponse } from "next/server";

const ALLOWED_PATCH_ROLES = [UserRole.ADMIN, UserRole.ORGANIZER, UserRole.USER] as const;

type RouteContext = {
    params: Promise<{ itemId: string }>;
};

type UpdateShoppingItemPayload = {
    name?: unknown;
    count?: unknown;
    unit?: unknown;
};

function parseUpdateShoppingItemPayload(payload: UpdateShoppingItemPayload): {
    name: string;
    count: number;
    unit: string | null;
} | null {
    const name = typeof payload.name === "string" ? payload.name.trim() : "";
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

async function ensureShoppingUnitExists(unit: string | null): Promise<void> {
    if (!unit) {
        return;
    }

    const existingUnit = await prisma.shoppingUnits.findFirst({
        where: {
            name: unit,
        },
        select: {
            id: true,
        },
    });

    if (!existingUnit) {
        await prisma.shoppingUnits.create({
            data: {
                name: unit,
            },
        });
    }
}

async function saveShoppingItemPreset(name: string, count: number, unit: string | null): Promise<void> {
    const existingPreset = await prisma.shoppingItems.findFirst({
        where: {
            name: {
                equals: name,
                mode: "insensitive",
            },
        },
        select: {
            id: true,
        },
    });

    if (existingPreset) {
        await prisma.shoppingItems.update({
            where: {
                id: existingPreset.id,
            },
            data: {
                name,
                count,
                unit,
            },
        });
        return;
    }

    await prisma.shoppingItems.create({
        data: {
            name,
            count,
            unit,
        },
    });
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

    await Promise.all([
        ensureShoppingUnitExists(parsedPayload.unit),
        saveShoppingItemPreset(parsedPayload.name, parsedPayload.count, parsedPayload.unit),
    ]);

    const updatedItem = await prisma.shoppingList.updateMany({
        where: {
            id: parsedItemId,
            done: false,
        },
        data: {
            name: parsedPayload.name,
            count: parsedPayload.count,
            unit: parsedPayload.unit,
        },
    });

    if (updatedItem.count === 0) {
        return NextResponse.json({ error: "Shopping item not found" }, { status: 404 });
    }

    const item = await prisma.shoppingList.findUnique({
        where: {
            id: parsedItemId,
        },
        select: {
            id: true,
            name: true,
            count: true,
            unit: true,
            user: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    if (!item) {
        return NextResponse.json({ error: "Shopping item not found" }, { status: 404 });
    }

    return NextResponse.json({
        item: {
            id: item.id,
            name: item.name,
            count: item.count,
            unit: item.unit,
            user: {
                id: item.user?.id,
                name: item.user?.name,
            },
        },
    });
}
