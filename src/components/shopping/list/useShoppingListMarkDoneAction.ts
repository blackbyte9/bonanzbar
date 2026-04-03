"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { markShoppingListItemDone } from "@/lib/shopping/doneItem";
import { usePendingIds } from "@/lib/async/usePendingIds";
import type { ShoppingColumns } from "./columns";

type UseShoppingListMarkDoneActionParams = {
    canMarkDone: boolean;
    setErrorAction: Dispatch<SetStateAction<string | null>>;
    setShoppingItemsAction: Dispatch<SetStateAction<ShoppingColumns[]>>;
};

type UseShoppingListMarkDoneActionResult = {
    isMarkDoneLoading: (id: number) => boolean;
    handleMarkDone: (itemId: number) => Promise<void>;
};

export function useShoppingListMarkDoneAction({
    canMarkDone,
    setErrorAction: setError,
    setShoppingItemsAction: setShoppingItems,
}: UseShoppingListMarkDoneActionParams): UseShoppingListMarkDoneActionResult {
    const { isPending, runWithPending } = usePendingIds<number>();

    const handleMarkDone = useCallback(
        async (itemId: number) => {
            if (!canMarkDone) {
                return;
            }

            await runWithPending(itemId, async () => {
                let removedItem: ShoppingColumns | undefined;

                setShoppingItems((prev) => {
                    removedItem = prev.find((item) => item.id === itemId);
                    return prev.filter((item) => item.id !== itemId);
                });

                try {
                    setError(null);
                    await markShoppingListItemDone(itemId);
                    toast.success("Erfolgreich auf erledigt gesetzt.");
                } catch {
                    if (removedItem) {
                        const itemToRestore = removedItem;
                        setShoppingItems((prev) => [itemToRestore, ...prev]);
                    }
                    setError("Konnte den Einkaufsartikel nicht auf erledigt setzen.");
                    toast.error("Konnte den Einkaufsartikel nicht auf erledigt setzen.");
                }
            });
        },
        [canMarkDone, runWithPending, setError, setShoppingItems],
    );

    return {
        isMarkDoneLoading: isPending,
        handleMarkDone,
    };
}
