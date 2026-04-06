import { isApiAuthFailure, requireApiAuth } from "@/lib/auth/apiAuth";
import { markShoppingListEntryDoneDb } from "@/lib/shopping/server/update";
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

    const updatedCount = await markShoppingListEntryDoneDb(parsedItemId);

    if (updatedCount === 0) {
        return NextResponse.json({ error: "Shopping item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}
