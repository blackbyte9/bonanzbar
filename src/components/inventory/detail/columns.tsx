"use client";

import type { CellContext, ColumnDef } from "@tanstack/react-table";

export type InventoryDetailColumns = {
    id: number;
    name: string;
    unit: string | null;
    packageSize: number | null;
};

type InventoryDetailDisplayColumnsOptions = {
    isSmallDisplay: boolean;
};

export function getColumnsForInventoryDetail(): ColumnDef<InventoryDetailColumns>[] {
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
    ];
}

export function getDisplayColumnsForInventoryDetail({
    isSmallDisplay,
}: InventoryDetailDisplayColumnsOptions): ColumnDef<InventoryDetailColumns>[] {
    const allColumns = getColumnsForInventoryDetail();

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
            return true;
        })
        .map((column): ColumnDef<InventoryDetailColumns> => {
            const accessorKey = "accessorKey" in column ? column.accessorKey : undefined;
            const columnId = "id" in column ? column.id : undefined;

            if (accessorKey === "name" || columnId === "name") {
                return {
                    ...column,
                    cell: (info: CellContext<InventoryDetailColumns, unknown>) => (
                        <span className="block w-full whitespace-normal wrap-break-word leading-snug">
                            {info.row.original.name}
                        </span>
                    ),
                };
            }

            return column;
        });
}
