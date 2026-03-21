import { isApiAuthFailure, requireApiAuth } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";
import { UserRole } from "@/prisma/enums";
import { NextResponse } from "next/server";

const ALLOWED_GET_ROLES = [UserRole.ADMIN, UserRole.ORGANIZER, UserRole.USER, UserRole.GUEST] as const;

export async function GET() {
    const authResult = await requireApiAuth(ALLOWED_GET_ROLES);

    if (isApiAuthFailure(authResult)) {
        return authResult.response;
    }

    const items = await prisma.shoppingItems.findMany({
        select: {
            name: true,
            count: true,
            unit: true,
            updatedAt: true,
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    const uniqueItemsByName = new Map<string, { name: string; count: number; unit: string | null }>();

    for (const item of items) {
        const normalizedName = item.name.trim().toLocaleLowerCase();

        if (!normalizedName || uniqueItemsByName.has(normalizedName)) {
            continue;
        }

        uniqueItemsByName.set(normalizedName, {
            name: item.name,
            count: item.count,
            unit: item.unit,
        });
    }

    const shoppingItems = Array.from(uniqueItemsByName.values()).sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );

    return NextResponse.json({
        shoppingItems,
    });
}
