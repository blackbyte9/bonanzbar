"use client";

import { useMemo } from "react";
import GenericDataTable from "@/components/generic/datatable";
import { getDisplayColumnsForShoppingList } from "./columns";
import { useSession } from "@/lib/auth/client";
import { useShoppingListEditPopover } from "./useShoppingListEditPopover";
import { useMediaQuery } from "@/lib/browser/useMediaQuery";
import { useShoppingListMarkDoneAction } from "./useShoppingListMarkDoneAction";
import type { SetShoppingErrorAction, SetShoppingItemsAction, ShoppingColumns } from "@/components/shopping/types";

const SMALL_DISPLAY_MEDIA_QUERY = "(max-width: 640px)";

type ShoppingListProps = {
    shoppingItems: ShoppingColumns[];
    setShoppingItemsAction: SetShoppingItemsAction;
    isLoading: boolean;
    error: string | null;
    setErrorAction: SetShoppingErrorAction;
};

export default function ShoppingList({
    shoppingItems,
    setShoppingItemsAction: setShoppingItems,
    isLoading,
    error,
    setErrorAction: setError,
}: ShoppingListProps) {
    const { data: session, isPending: isSessionLoading } = useSession();
    const isSmallDisplay = useMediaQuery(SMALL_DISPLAY_MEDIA_QUERY);
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
        <>
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
        </>
    );
}
