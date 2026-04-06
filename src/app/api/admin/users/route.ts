
import { isApiAuthFailure, requireApiAuth } from "@/lib/auth/apiAuth";
import { readUsersDb } from "@/lib/admin/server/read";
import { UserRole } from "@/prisma/enums";
import { NextResponse } from "next/server";

const ALLOWED_ROLES = [UserRole.ADMIN, UserRole.ORGANIZER] as const;

export async function GET() {
    const authResult = await requireApiAuth(ALLOWED_ROLES);

    if (isApiAuthFailure(authResult)) {
        return authResult.response;
    }

    const users = await readUsersDb();

    return NextResponse.json({
        users: users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        })),
    });
}
