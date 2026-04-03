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

    const inventories = await prisma.inventoryDates.findMany({
        where: {
            userId: authResult.userId,
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

    return NextResponse.json({
        inventories: inventories.map((inventory) => ({
            id: inventory.id,
            startDate: inventory.startDate,
            endDate: inventory.endDate,
            createdAt: inventory.createdAt,
        })),
    });
}
