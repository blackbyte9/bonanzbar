import { isApiAuthFailure, requireApiAuth } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";
import { UserRole } from "@/prisma/enums";
import { NextResponse } from "next/server";

const ALLOWED_ROLES = [UserRole.ADMIN, UserRole.ORGANIZER] as const;

type RouteContext = {
    params: Promise<{ userId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
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
            { error: "Admins können keinen anderen Admin löschen." },
            { status: 403 },
        );
    }

    if (authResult.userId === userId) {
        return NextResponse.json({ error: "Sie können Ihr eigenes Konto nicht löschen." }, { status: 400 });
    }

    await prisma.user.delete({
        where: { id: userId },
    });

    return NextResponse.json({ success: true });
}
