import { isApiAuthFailure, requireApiAuth } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";
import { UserRole } from "@/prisma/enums";
import { NextResponse } from "next/server";

const ALLOWED_GET_ROLES = [UserRole.ADMIN, UserRole.ORGANIZER, UserRole.USER] as const;

export async function GET() {
    const authResult = await requireApiAuth(ALLOWED_GET_ROLES);

    if (isApiAuthFailure(authResult)) {
        return authResult.response;
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
        },
        orderBy: {
            name: "asc",
        },
    });

    return NextResponse.json({
        items,
    });
}
