"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UserRole } from "@/prisma/enums";
import { NativeSelect, NativeSelectOption } from "@/shadcn/components/ui/native-select";
import { Button } from "@/shadcn/components/ui/button";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type UserColumns = {
    id: string
    name: string
    email: string
    role: UserRole | null
}

type UserColumnsOptions = {
    onRoleChangeAction: (userId: string, role: UserRole) => void | Promise<void>
    onDeleteUserAction: (userId: string) => void | Promise<void>
    updatingUserIds: Record<string, boolean>
    deletingUserIds: Record<string, boolean>
    currentUserRole: UserRole | null
}

const ROLE_OPTIONS: UserRole[] = [
    UserRole.ADMIN,
    UserRole.ORGANIZER,
    UserRole.USER,
    UserRole.GUEST,
    UserRole.INACTIVE,
];

export function getColumns({ onRoleChangeAction, onDeleteUserAction, updatingUserIds, deletingUserIds, currentUserRole }: UserColumnsOptions): ColumnDef<UserColumns>[] {
    return [
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => {
                const userId = row.original.id;
                const role = row.original.role ?? UserRole.INACTIVE;
                const isProtectedAdminTarget = currentUserRole === UserRole.ADMIN && row.original.role === UserRole.ADMIN;
                const isUpdating = Boolean(updatingUserIds[userId] || deletingUserIds[userId] || isProtectedAdminTarget);

                return (
                    <NativeSelect
                        value={role}
                        onChange={(event) => {
                            void onRoleChangeAction(userId, event.target.value as UserRole);
                        }}
                        disabled={isUpdating}
                        className="w-40"
                        aria-label={`Role for ${row.original.email}`}
                    >
                        {ROLE_OPTIONS.map((roleOption) => (
                            <NativeSelectOption key={roleOption} value={roleOption}>
                                {roleOption}
                            </NativeSelectOption>
                        ))}
                    </NativeSelect>
                );
            },
        },
        {
            accessorKey: "id",
            header: "Actions",
            cell: ({ row }) => {
                const userId = row.original.id;
                const isProtectedAdminTarget = currentUserRole === UserRole.ADMIN && row.original.role === UserRole.ADMIN;
                const isDeleting = Boolean(deletingUserIds[userId] || isProtectedAdminTarget);

                return (
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={isDeleting}
                        onClick={() => {
                            void onDeleteUserAction(userId);
                        }}
                    >
                        {deletingUserIds[userId] ? "Deleting..." : "Delete"}
                    </Button>
                );
            },
        },
    ];
}
