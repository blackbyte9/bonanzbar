"use client";

import type { CellContext, ColumnDef } from "@tanstack/react-table";

export type InventoryListColumns = {
    id: number;
    name: string;
    unit: string | null;
    packageSize: number | null;
    inventoryCount: number | null;
    inventoryPackage: number | null;
    inventoryPartial: number | null;
    hasNoInventoryItem: boolean;
};

type InventoryListDisplayColumnsOptions = {
    isSmallDisplay: boolean;
};

export function getColumnsForInventoryList(): ColumnDef<InventoryListColumns>[] {
    return [
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "unit",
            header: "Einheit",
            cell: ({ row }) => row.original.unit ?? "-",
        },
        {
            accessorKey: "packageSize",
            header: "Packungsgröße",
            cell: ({ row }) => row.original.packageSize ?? 1,
        },
        {
            accessorKey: "inventoryCount",
            header: "Anzahl",
            cell: ({ row }) => row.original.inventoryCount ?? "-",
        },
        {
            accessorKey: "inventoryPackage",
            header: "Packungen",
            cell: ({ row }) => row.original.inventoryPackage ?? "-",
        },
        {
            accessorKey: "inventoryPartial",
            header: "Teilmenge",
            cell: ({ row }) => row.original.inventoryPartial ?? "-",
        },
    ];
}

export function getDisplayColumnsForInventoryList({
    isSmallDisplay,
}: InventoryListDisplayColumnsOptions): ColumnDef<InventoryListColumns>[] {
    const allColumns = getColumnsForInventoryList();

    if (!isSmallDisplay) {
        return allColumns;
    }

    return allColumns
        .filter((column) => {
            if ("accessorKey" in column && column.accessorKey === "packageSize") {
                return false;
            }
            if ("id" in column && column.id === "packageSize") {
                return false;
            }
            if ("accessorKey" in column && column.accessorKey === "inventoryPartial") {
                return false;
            }
            if ("id" in column && column.id === "inventoryPartial") {
                return false;
            }
            return true;
        })
        .map((column): ColumnDef<InventoryListColumns> => {
            const accessorKey = "accessorKey" in column ? column.accessorKey : undefined;
            const columnId = "id" in column ? column.id : undefined;

            if (accessorKey === "name" || columnId === "name") {
                return {
                    ...column,
                    cell: (info: CellContext<InventoryListColumns, unknown>) => (
                        <span className="block w-full whitespace-normal wrap-break-word leading-snug">
                            {info.row.original.name}
                        </span>
                    ),
                };
            }

            return column;
        });
}
