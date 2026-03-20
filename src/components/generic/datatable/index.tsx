"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shadcn/components/ui/table";

interface GenericDataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    emptyMessage?: string;
    isLoading?: boolean;
    error?: string | null;
    loadingMessage?: string;
    loadingVariant?: "text" | "skeleton";
    skeletonRowCount?: number;
}

export default function GenericDataTable<TData, TValue>({
    columns,
    data,
    emptyMessage = "No results.",
    isLoading = false,
    error = null,
    loadingMessage = "Loading...",
    loadingVariant = "text",
    skeletonRowCount = 5,
}: GenericDataTableProps<TData, TValue>) {
    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="w-full overflow-x-auto rounded-md border">
            <Table className="w-full table-fixed">
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {isLoading && !error && loadingVariant === "skeleton" ? (
                        Array.from({ length: skeletonRowCount }).map((_, rowIndex) => (
                            <TableRow key={`skeleton-row-${rowIndex}`}>
                                {columns.map((_, columnIndex) => (
                                    <TableCell key={`skeleton-cell-${rowIndex}-${columnIndex}`}>
                                        <div className="h-4 w-full animate-pulse rounded bg-muted" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : !isLoading && !error && table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="truncate">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className={error ? "h-24 text-center text-sm text-red-500" : "h-24 text-center text-sm text-muted-foreground"}
                            >
                                {error ?? (isLoading ? loadingMessage : emptyMessage)}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
