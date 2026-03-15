import { UserRole } from "@/prisma/enums";

export type AdminUser = {
    id: string;
    name: string;
    email: string;
    role: UserRole | null;
};

export default async function loadUsers(): Promise<AdminUser[]> {
    const response = await fetch("/api/admin/users", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Failed to load users.");
    }

    const payload = (await response.json()) as { users?: AdminUser[] };

    return payload.users ?? [];
}
