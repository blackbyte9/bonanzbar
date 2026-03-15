import { AdminUser } from "@/lib/admin/loadUsers";
import type { Dispatch, SetStateAction } from "react";

type DeleteUserActionParams<TUser extends AdminUser> = {
    userId: string;
    setUsers: Dispatch<SetStateAction<TUser[]>>;
    setDeletingUserIds: Dispatch<SetStateAction<Record<string, boolean>>>;
    setError: Dispatch<SetStateAction<string | null>>;
    confirmMessage?: string;
};

function confirmDeleteUser(message = "Delete this user account?"): boolean {
    return window.confirm(message);
}

function removeUserFromList<TUser extends AdminUser>(users: TUser[], userId: string): {
    nextUsers: TUser[];
    deletedUser: TUser | undefined;
} {
    const deletedUser = users.find((user) => user.id === userId);
    const nextUsers = users.filter((user) => user.id !== userId);

    return {
        nextUsers,
        deletedUser,
    };
}

function restoreUserToList<TUser extends AdminUser>(users: TUser[], user: TUser): TUser[] {
    return [user, ...users];
}

async function deleteUser(userId: string): Promise<void> {
    const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Failed to delete user.");
    }
}

export default async function executeDeleteUserAction<TUser extends AdminUser>({
    userId,
    setUsers,
    setDeletingUserIds,
    setError,
    confirmMessage,
}: DeleteUserActionParams<TUser>): Promise<void> {
    const confirmed = confirmDeleteUser(confirmMessage);

    if (!confirmed) {
        return;
    }

    let deletedUser: TUser | undefined;

    setDeletingUserIds((prev) => ({
        ...prev,
        [userId]: true,
    }));

    setUsers((prev) => {
        const { nextUsers, deletedUser: deleted } = removeUserFromList(prev, userId);
        deletedUser = deleted;
        return nextUsers;
    });

    try {
        setError(null);
        await deleteUser(userId);
    } catch {
        if (deletedUser) {
            const userToRestore = deletedUser;
            setUsers((prev) => restoreUserToList(prev, userToRestore));
        }
        setError("Could not delete user.");
    } finally {
        setDeletingUserIds((prev) => ({
            ...prev,
            [userId]: false,
        }));
    }
}
