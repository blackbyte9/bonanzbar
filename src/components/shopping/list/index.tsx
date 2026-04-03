"use client";

import { useMemo } from "react";
import GenericDataTable from "@/components/generic/datatable";
import { getDisplayColumnsForShoppingList } from "./columns";
import { AddShoppingItemForm } from "./addItem";
import { useSession } from "@/lib/auth/client";
import TablePageShell from "@/components/generic/datatable/tablePageShell";
import { useShoppingListEditPopover } from "./useShoppingListEditPopover";
import { useMediaQuery } from "@/lib/browser/useMediaQuery";
import { useShoppingListData } from "./useShoppingListData";
import { useShoppingListMarkDoneAction } from "./useShoppingListMarkDoneAction";

const SMALL_DISPLAY_MEDIA_QUERY = "(max-width: 640px)";

export default function ShoppingList() {
    const { data: session, isPending: isSessionLoading } = useSession();
    const isSmallDisplay = useMediaQuery(SMALL_DISPLAY_MEDIA_QUERY);
    const {
        data: shoppingItems,
        setData: setShoppingItems,
        isLoading,
        error,
        setError,
    } = useShoppingListData();
    const canAddItems = !isSessionLoading && session?.user?.role !== "GUEST";
    const canMarkDone = !isSessionLoading && session?.user?.role !== "GUEST";
    const canEditItems = !isSessionLoading && session?.user?.role !== "GUEST";

    const { isMarkDoneLoading, handleMarkDone } = useShoppingListMarkDoneAction({
        canMarkDone,
        setErrorAction: setError,
        setShoppingItemsAction: setShoppingItems,
    });

    const { rowClickHandler, editPopoverNode } = useShoppingListEditPopover({
        canEditItems,
        canMarkDone,
        shoppingItems,
        setErrorAction: setError,
        setShoppingItemsAction: setShoppingItems,
        isMarkDoneLoadingAction: isMarkDoneLoading,
        onMarkDoneAction: handleMarkDone,
    });

    const columns = useMemo(() => {
        return getDisplayColumnsForShoppingList({
            canMarkDone,
            isDoneLoadingAction: isMarkDoneLoading,
            onMarkDoneAction: (itemId) => {
                void handleMarkDone(itemId);
            },
            isSmallDisplay,
        });
    }, [canMarkDone, handleMarkDone, isMarkDoneLoading, isSmallDisplay]);

    return (
        <TablePageShell title="Einkaufsartikel">
            {canAddItems ? (
                <AddShoppingItemForm setErrorAction={setError} setShoppingItemsAction={setShoppingItems} />
            ) : null}

            <GenericDataTable
                columns={columns}
                data={shoppingItems}
                emptyMessage="Keine Einkaufsartikel gefunden."
                isLoading={isLoading}
                error={error}
                rowClickHandler={canEditItems ? rowClickHandler : undefined}
                loadingMessage="Lade Einkaufsartikel..."
                loadingVariant="skeleton"
                skeletonRowCount={6}
            />
            {editPopoverNode}
        </TablePageShell>
    );
}
