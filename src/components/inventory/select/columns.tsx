"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/shadcn/components/ui/button";

export type InventoryColumns = {
    id: number;
    startDate: string;
    endDate: string | null;
    createdAt: Date;
    isActive: boolean;
};

type InventoryColumnsOptions = {
    canSelect: boolean;
    onSelectAction: (id: number) => void;
    isLoadingAction: (id: number) => boolean;
};

type InventoryDisplayColumnsOptions = InventoryColumnsOptions;

export function getColumnsForInventoryList({
    canSelect,
    onSelectAction: onSelect,
    isLoadingAction: isLoading,
}: InventoryColumnsOptions): ColumnDef<InventoryColumns>[] {
    const baseColumns: ColumnDef<InventoryColumns>[] = [
        {
            accessorKey: "startDate",
            header: "Startdatum",
            cell: ({ row }) => new Date(row.original.startDate).toLocaleDateString("de-DE"),
        },
        {
            accessorKey: "endDate",
            header: "Enddatum",
            cell: ({ row }) => row.original.endDate ? new Date(row.original.endDate).toLocaleDateString("de-DE") : "-",
        },
        {
            accessorKey: "createdAt",
            header: "Erstellt am",
            cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("de-DE"),
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) => (row.original.isActive ? "Aktiv" : "Abgeschlossen"),
        },
    ];

    if (!canSelect) {
        return baseColumns;
    }

    return [
        ...baseColumns,
        {
            id: "select",
            header: "Aktion",
            cell: ({ row }) => (
                <Button
                    onClick={() => onSelect(row.original.id)}
                    disabled={isLoading(row.original.id)}
                    size="sm"
                >
                    {isLoading(row.original.id) ? "Wird geladen..." : "Auswählen"}
                </Button>
            ),
        },
    ];
}

export function getDisplayColumnsForInventoryList(options: InventoryDisplayColumnsOptions): ColumnDef<InventoryColumns>[] {
    return getColumnsForInventoryList(options);
}
