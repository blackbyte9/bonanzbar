"use client";

import type { CellContext, ColumnDef } from "@tanstack/react-table";
import { Button } from "@/shadcn/components/ui/button";
import type { ShoppingColumns } from "@/components/shopping/types";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type { ShoppingColumns };

type ShoppingColumnsOptions = {
    canMarkDone: boolean;
    isDoneLoadingAction: (id: number) => boolean;
    onMarkDoneAction: (id: number) => void;
};

type ShoppingDisplayColumnsOptions = ShoppingColumnsOptions & {
    isSmallDisplay: boolean;
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
                        onClick={(event) => {
                            event.stopPropagation();
                            onMarkDone(itemId);
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? "Speichern..." : "Erledigt"}
                    </Button>
                );
            },
        },
    ];
}

export function getDisplayColumnsForShoppingList({
    canMarkDone,
    isDoneLoadingAction,
    onMarkDoneAction,
    isSmallDisplay,
}: ShoppingDisplayColumnsOptions): ColumnDef<ShoppingColumns>[] {
    const allColumns = getColumnsForShoppingList({
        canMarkDone,
        isDoneLoadingAction,
        onMarkDoneAction,
    });

    if (!isSmallDisplay) {
        return allColumns;
    }

    return allColumns
        .filter((column) => {
            if ("accessorKey" in column && column.accessorKey === "userName") {
                return false;
            }
            if ("id" in column && column.id === "userName") {
                return false;
            }
            return true;
        })
        .map((column): ColumnDef<ShoppingColumns> => {
            const accessorKey = "accessorKey" in column ? column.accessorKey : undefined;
            const columnId = "id" in column ? column.id : undefined;

            if (accessorKey === "name" || columnId === "name") {
                return {
                    ...column,
                    cell: (info: CellContext<ShoppingColumns, unknown>) => (
                        <span className="block w-full whitespace-normal wrap-break-word leading-snug">
                            {info.row.original.name}
                        </span>
                    ),
                };
            }

            return column;
        });
}
