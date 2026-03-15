import { isApiAuthFailure, requireApiAuth } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";
import { UserRole } from "@/prisma/enums";
import { NextResponse } from "next/server";

const ALLOWED_ROLES = [UserRole.ADMIN, UserRole.ORGANIZER, UserRole.USER] as const;

type RouteContext = {
    params: Promise<{ itemId: string }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
    const authResult = await requireApiAuth(ALLOWED_ROLES);

    if (isApiAuthFailure(authResult)) {
        return authResult.response;
    }

    const { itemId } = await context.params;
    const parsedItemId = Number(itemId);

    if (!Number.isInteger(parsedItemId) || parsedItemId <= 0) {
        return NextResponse.json({ error: "Invalid shopping item id" }, { status: 400 });
    }

    const updateResult = await prisma.shoppingList.updateMany({
        where: {
            id: parsedItemId,
            done: false,
        },
        data: {
            done: true,
            doneAt: new Date(),
        },
    });

    if (updateResult.count === 0) {
        return NextResponse.json({ error: "Shopping item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}
