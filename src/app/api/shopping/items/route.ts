import { isApiAuthFailure, requireApiAuth } from "@/lib/auth/apiAuth";
import { readShoppingItemPresetsDb } from "@/lib/shopping/server/read";
import { UserRole } from "@/prisma/enums";
import { NextResponse } from "next/server";

const ALLOWED_GET_ROLES = [UserRole.ADMIN, UserRole.ORGANIZER, UserRole.USER, UserRole.GUEST] as const;

export async function GET() {
    const authResult = await requireApiAuth(ALLOWED_GET_ROLES);

    if (isApiAuthFailure(authResult)) {
        return authResult.response;
    }

    const shoppingItems = await readShoppingItemPresetsDb();

    return NextResponse.json({
        shoppingItems,
    });
}
