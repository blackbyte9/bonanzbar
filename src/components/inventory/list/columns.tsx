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
    inventorySum: number;
    hasNoInventoryItem: boolean;
};

type InventoryListDisplayColumnsOptions = {
    isSmallDisplay: boolean;
    isInventoryClosed: boolean;
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
            header: "Einzel",
            cell: ({ row }) => row.original.inventoryCount ?? "-",
        },
        {
            accessorKey: "inventoryPackage",
            header: "Pack",
            cell: ({ row }) => row.original.inventoryPackage ?? "-",
        },
        {
            accessorKey: "inventoryPartial",
            header: "Teil",
            cell: ({ row }) => row.original.inventoryPartial ?? "-",
        },
        {
            accessorKey: "inventorySum",
            header: "Summe",
            cell: ({ row }) => row.original.inventorySum,
        },
    ];
}

export function getDisplayColumnsForInventoryList({
    isSmallDisplay,
    isInventoryClosed,
}: InventoryListDisplayColumnsOptions): ColumnDef<InventoryListColumns>[] {
    const allColumns = getColumnsForInventoryList();

    if (!isSmallDisplay) {
        return allColumns;
    }

    return allColumns
        .filter((column) => {
            if ("accessorKey" in column && column.accessorKey === "unit") {
                return false;
            }
            if ("id" in column && column.id === "unit") {
                return false;
            }
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
            if (!isInventoryClosed && "accessorKey" in column && column.accessorKey === "inventorySum") {
                return false;
            }
            if (!isInventoryClosed && "id" in column && column.id === "inventorySum") {
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
