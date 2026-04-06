import { isApiAuthFailure, requireApiAuth } from "@/lib/auth/apiAuth";
import { createInventoryDb } from "@/lib/inventory/server/create";
import { readActiveInventoryDb } from "@/lib/inventory/server/read";
import { UserRole } from "@/prisma/enums";
import { NextResponse } from "next/server";

const ALLOWED_GET_ROLES = [UserRole.ADMIN, UserRole.ORGANIZER, UserRole.USER, UserRole.GUEST] as const;
const ALLOWED_POST_ROLES = [UserRole.ADMIN, UserRole.ORGANIZER, UserRole.USER] as const;

type CreateInventoryPayload = {
    startDate?: unknown;
};

function parseCreateInventoryPayload(payload: CreateInventoryPayload): {
    startDate: string;
} | null {
    const startDate = typeof payload.startDate === "string" ? payload.startDate.trim() : "";

    if (!startDate) {
        return null;
    }

    return {
        startDate,
    };
}

export async function GET() {
    const authResult = await requireApiAuth(ALLOWED_GET_ROLES);

    if (isApiAuthFailure(authResult)) {
        return authResult.response;
    }

    const activeInventory = await readActiveInventoryDb(authResult.userId);

    return NextResponse.json({
        activeInventory,
    });
}

export async function POST(request: Request) {
    const authResult = await requireApiAuth(ALLOWED_POST_ROLES);

    if (isApiAuthFailure(authResult)) {
        return authResult.response;
    }

    let payload: CreateInventoryPayload;

    try {
        payload = (await request.json()) as CreateInventoryPayload;
    } catch {
        return NextResponse.json({ error: "Ungültiges JSON-Format" }, { status: 400 });
    }

    const parsed = parseCreateInventoryPayload(payload);

    if (!parsed) {
        return NextResponse.json({ error: "Ungültige Eingabe" }, { status: 400 });
    }

    try {
        const inventory = await createInventoryDb(parsed.startDate, authResult.userId);

        return NextResponse.json({
            inventory,
        });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error creating inventory:", error);
        return NextResponse.json({ error: "Fehler beim Erstellen des Inventars" }, { status: 500 });
    }
}
