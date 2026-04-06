"use client";

import GenericDataTable from "@/components/generic/datatable";
import { useMediaQuery } from "@/lib/browser/useMediaQuery";
import { useMemo } from "react";
import { getDisplayColumnsForInventoryList } from "./columns";
import { useInventoryListEditSheet } from "./useInventoryListEditSheet";
import { useInventoryListData } from "./useInventoryListData";

const SMALL_DISPLAY_MEDIA_QUERY = "(max-width: 640px)";

type InventoryListProps = {
    inventoryId: number | null;
    isReadOnly?: boolean;
    isInventoryClosed?: boolean;
};

export default function InventoryList({
    inventoryId,
    isReadOnly = false,
    isInventoryClosed = false,
}: InventoryListProps) {
    const isSmallDisplay = useMediaQuery(SMALL_DISPLAY_MEDIA_QUERY);
    const {
        data: inventoryItems,
        setData: setInventoryItems,
        isLoading,
        error,
        setError,
    } = useInventoryListData(inventoryId);

    const { rowClickHandler, editSheetNode } = useInventoryListEditSheet({
        inventoryId,
        inventoryItems,
        setErrorAction: setError,
        setInventoryItemsAction: setInventoryItems,
    });

    const columns = useMemo(() => {
        return getDisplayColumnsForInventoryList({
            isSmallDisplay,
            isInventoryClosed,
        });
    }, [isInventoryClosed, isSmallDisplay]);

    return (
        <>
            <GenericDataTable
                columns={columns}
                data={inventoryItems}
                emptyMessage="Keine Inventurartikel gefunden."
                isLoading={isLoading}
                error={error}
                loadingMessage="Lade Inventurartikel..."
                loadingVariant="skeleton"
                skeletonRowCount={6}
                rowClickHandler={isReadOnly ? undefined : rowClickHandler}
                rowClassNameResolver={(row) => row.original.hasNoInventoryItem ? "bg-red-50/70" : undefined}
            />
            {editSheetNode}
        </>
    );
}
