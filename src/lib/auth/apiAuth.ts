import "server-only";

import { auth } from "@/lib/auth";
import { UserRole } from "@/prisma/enums";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

type ApiAuthSuccess = {
    userId: string;
    userRole: UserRole | null;
};

type ApiAuthFailure = {
    response: NextResponse;
};

type ApiAuthResult = ApiAuthSuccess | ApiAuthFailure;

export function isApiAuthFailure(result: ApiAuthResult): result is ApiAuthFailure {
    return "response" in result;
}

export async function requireApiAuth(allowedRoles?: readonly UserRole[]): Promise<ApiAuthResult> {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return {
            response: NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 }),
        };
    }

    const userRole = (session.user.role as UserRole | null | undefined) ?? null;

    if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
        return {
            response: NextResponse.json({ error: "Verboten" }, { status: 403 }),
        };
    }

    return {
        userId: session.user.id,
        userRole,
    };
}
