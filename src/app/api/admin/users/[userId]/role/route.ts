
import { isApiAuthFailure, requireApiAuth } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";
import { UserRole } from "@/prisma/enums";
import { NextResponse } from "next/server";

const ALLOWED_ROLES = [UserRole.ADMIN, UserRole.ORGANIZER] as const;
const TARGET_ROLES = new Set<UserRole>([
    UserRole.ADMIN,
    UserRole.ORGANIZER,
    UserRole.USER,
    UserRole.GUEST,
    UserRole.INACTIVE,
]);

type RouteContext = {
    params: Promise<{ userId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
    const authResult = await requireApiAuth(ALLOWED_ROLES);

    if (isApiAuthFailure(authResult)) {
        return authResult.response;
    }

    const actorRole = authResult.userRole;

    const { userId } = await context.params;

    const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            role: true,
        },
    });

    if (!targetUser) {
        return NextResponse.json({ error: "Benutzer nicht gefunden." }, { status: 404 });
    }

    if (actorRole === UserRole.ADMIN && targetUser.role === UserRole.ADMIN) {
        return NextResponse.json(
            { error: "Admins können die Rolle eines anderen Admins nicht ändern." },
            { status: 403 },
        );
    }

    const body = (await request.json()) as { role?: string };

    if (!body.role || !TARGET_ROLES.has(body.role as UserRole)) {
        return NextResponse.json({ error: "Ungültige Rolle" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            role: body.role as UserRole,
        },
        select: {
            id: true,
            role: true,
        },
    });

    return NextResponse.json({
        user: updatedUser,
    });
}
