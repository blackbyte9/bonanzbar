import { isApiAuthFailure, requireApiAuth } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";
import { UserRole } from "@/prisma/enums";
import { NextResponse } from "next/server";

const ALLOWED_GET_ROLES = [UserRole.ADMIN, UserRole.ORGANIZER, UserRole.USER, UserRole.GUEST] as const;
const ALLOWED_POST_ROLES = [UserRole.ADMIN, UserRole.ORGANIZER, UserRole.USER] as const;

type CreateShoppingItemPayload = {
    name?: unknown;
    count?: unknown;
    unit?: unknown;
};

function parseCreateShoppingItemPayload(payload: CreateShoppingItemPayload): {
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

export async function GET() {
    const authResult = await requireApiAuth(ALLOWED_GET_ROLES);

    if (isApiAuthFailure(authResult)) {
        return authResult.response;
    }

    const shoppingList = await prisma.shoppingList.findMany({
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
        where: {
            done: false,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return NextResponse.json({
        shoppingList: shoppingList.map((item) => ({
            id: item.id,
            name: item.name,
            count: item.count,
            unit: item.unit,
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

    const item = await prisma.shoppingList.create({
        data: {
            name: parsedPayload.name,
            count: parsedPayload.count,
            unit: parsedPayload.unit,
            userId: authResult.userId,
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

    return NextResponse.json(
        {
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
        },
        { status: 201 },
    );
}
