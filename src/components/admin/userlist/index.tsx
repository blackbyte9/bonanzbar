"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getColumns, UserColumns } from "./columns";
import GenericDataTable from "@/components/generic/datatable";
import { useTableDataLoader } from "@/components/generic/datatable/useTableDataLoader";
import { UserRole } from "@/prisma/enums";
import { useSession } from "@/lib/auth/client";
import loadUsers from "@/lib/admin/loadUsers";
import executeDeleteUserAction from "@/lib/admin/deleteUser";
import executeRoleChangeAction from "@/lib/admin/changeUserRole";
import TablePageShell from "@/components/generic/datatable/tablePageShell";

export default function UserList() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<UserColumns[]>([]);
    const currentUserRole = (session?.user?.role as UserRole | null | undefined) ?? null;
    const { isLoading, error, setError, runWithTableLoading } = useTableDataLoader();
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
    }, [setError]);

    const handleDeleteUser = useCallback(async (userId: string) => {
        await executeDeleteUserAction<UserColumns>({
            userId,
            setUsers,
            setDeletingUserIds,
            setError,
        });
    }, [setError]);

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
        async function fetchUsers() {
            const loadedUsers = await runWithTableLoading({
                loader: loadUsers,
                errorMessage: "Konnte Benutzer nicht laden.",
            });

            if (loadedUsers) {
                setUsers(loadedUsers);
            }
        }

        void fetchUsers();

    }, [runWithTableLoading]);

    return (
        <TablePageShell title="Benutzerliste">
            <GenericDataTable
                columns={columns}
                data={users}
                isLoading={isLoading}
                error={error}
                loadingMessage="Benutzer werden geladen..."
                loadingVariant="skeleton"
                skeletonRowCount={6}
            />
        </TablePageShell>
    );
};
