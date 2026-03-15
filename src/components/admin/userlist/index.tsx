"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getColumns, UserColumns } from "./columns";
import GenericDataTable from "@/components/generic/datatable";
import { UserRole } from "@/prisma/enums";
import { useSession } from "@/lib/auth/client";
import loadUsers from "@/lib/admin/loadUsers";
import executeDeleteUserAction from "@/lib/admin/deleteUser";
import executeRoleChangeAction from "@/lib/admin/changeUserRole";

export default function UserList() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<UserColumns[]>([]);
    const currentUserRole = (session?.user?.role as UserRole | null | undefined) ?? null;

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingUserIds, setUpdatingUserIds] = useState<Record<string, boolean>>({});
    const [deletingUserIds, setDeletingUserIds] = useState<Record<string, boolean>>({});

    const handleRoleChange = useCallback(async (userId: string, role: UserRole) => {
        await executeRoleChangeAction<UserColumns>({
            userId,
            role,
            setUsers,
            setUpdatingUserIds,
            setError,
        });
    }, []);

    const handleDeleteUser = useCallback(async (userId: string) => {
        await executeDeleteUserAction<UserColumns>({
            userId,
            setUsers,
            setDeletingUserIds,
            setError,
        });
    }, []);

    const columns = useMemo(
        () =>
            getColumns({
                onRoleChangeAction: handleRoleChange,
                onDeleteUserAction: handleDeleteUser,
                updatingUserIds,
                deletingUserIds,
                currentUserRole,
            }),
        [handleRoleChange, handleDeleteUser, updatingUserIds, deletingUserIds, currentUserRole],
    );

    useEffect(() => {
        let isMounted = true;

        async function fetchUsers() {
            try {
                setIsLoading(true);
                setError(null);

                const users = await loadUsers();

                if (isMounted) {
                    setUsers(users);
                }
            } catch {
                if (isMounted) {
                    setError("Could not load users.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void fetchUsers();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">User List</h1>

            {error ? (
                <p className="text-sm text-red-500">{error}</p>
            ) : isLoading ? (
                <p className="text-sm text-muted-foreground">Loading users...</p>
            ) : (
                <GenericDataTable columns={columns} data={users} />
            )}
        </div>
    );
};
