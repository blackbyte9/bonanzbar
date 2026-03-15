import { AdminUser } from "@/lib/admin/loadUsers";
import { UserRole } from "@/prisma/enums";
import type { Dispatch, SetStateAction } from "react";

type RoleChangeActionParams<TUser extends AdminUser> = {
    userId: string;
    role: UserRole;
    setUsers: Dispatch<SetStateAction<TUser[]>>;
    setUpdatingUserIds: Dispatch<SetStateAction<Record<string, boolean>>>;
    setError: Dispatch<SetStateAction<string | null>>;
};

export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
    const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
    });

    if (!response.ok) {
        throw new Error("Failed to update role.");
    }
}

export default async function executeRoleChangeAction<TUser extends AdminUser>({
    userId,
    role,
    setUsers,
    setUpdatingUserIds,
    setError,
}: RoleChangeActionParams<TUser>): Promise<void> {
    let previousRole: TUser["role"] | undefined;

    setUpdatingUserIds((prev) => ({
        ...prev,
        [userId]: true,
    }));

    setUsers((prev) =>
        prev.map((user) => {
            if (user.id === userId) {
                previousRole = user.role;
                return { ...user, role };
            }

            return user;
        }),
    );

    try {
        setError(null);
        await updateUserRole(userId, role);
    } catch {
        setUsers((prev) =>
            prev.map((user) =>
                user.id === userId
                    ? { ...user, role: previousRole ?? UserRole.INACTIVE }
                    : user,
            ),
        );
        setError("Could not update user role.");
    } finally {
        setUpdatingUserIds((prev) => ({
            ...prev,
            [userId]: false,
        }));
    }
};
