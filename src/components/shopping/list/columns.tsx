"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/shadcn/components/ui/button";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type ShoppingColumns = {
    id: number
    name: string
    count: number
    unit: string | null
    userName: string | null
}

type ShoppingColumnsOptions = {
    canMarkDone: boolean;
    isDoneLoadingAction: (id: number) => boolean;
    onMarkDoneAction: (id: number) => void;
};

export function getColumnsForShoppingList({
    canMarkDone,
    isDoneLoadingAction: isDoneLoading,
    onMarkDoneAction: onMarkDone,
}: ShoppingColumnsOptions): ColumnDef<ShoppingColumns>[] {
    const baseColumns: ColumnDef<ShoppingColumns>[] = [
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "count",
            header: "Anzahl",
        },
        {
            accessorKey: "unit",
            header: "Einheit",
            cell: ({ row }) => row.original.unit ?? "-",
        },
        {
            accessorKey: "userName",
            header: "Hinzugefügt von",
            cell: ({ row }) => row.original.userName ?? "-",
        },
    ];

    if (!canMarkDone) {
        return baseColumns;
    }

    return [
        ...baseColumns,
        {
            id: "actions",
            header: "",
            cell: ({ row }) => {
                const itemId = row.original.id;
                const isLoading = isDoneLoading(itemId);

                return (
                    <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => onMarkDone(itemId)}
                        disabled={isLoading}
                    >
                        {isLoading ? "Speichern..." : "Erledigt"}
                    </Button>
                );
            },
        },
    ];
};
