import { isApiAuthFailure, requireApiAuth } from "@/lib/auth/apiAuth";
import { readInventoryItemsForSelectionDb } from "@/lib/inventory/server/read";
import { UserRole } from "@/prisma/enums";
import { NextResponse } from "next/server";

const ALLOWED_GET_ROLES = [UserRole.ADMIN, UserRole.ORGANIZER, UserRole.USER] as const;

export async function GET() {
    const authResult = await requireApiAuth(ALLOWED_GET_ROLES);

    if (isApiAuthFailure(authResult)) {
        return authResult.response;
    }

    const items = await readInventoryItemsForSelectionDb();

    return NextResponse.json({
        items,
    });
}
