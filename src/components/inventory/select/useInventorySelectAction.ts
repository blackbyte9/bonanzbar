"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { usePendingIds } from "@/lib/async/usePendingIds";

type UseInventorySelectActionParams = {
    onSelectInventoryAction: (inventoryId: number) => Promise<void>;
};

type UseInventorySelectActionResult = {
    isSelecting: (id: number) => boolean;
    handleSelectInventory: (inventoryId: number) => Promise<void>;
};

export function useInventorySelectAction({
    onSelectInventoryAction,
}: UseInventorySelectActionParams): UseInventorySelectActionResult {
    const { isPending, runWithPending } = usePendingIds<number>();

    const handleSelectInventory = useCallback(async (inventoryId: number) => {
        await runWithPending(inventoryId, async () => {
            try {
                await onSelectInventoryAction(inventoryId);
            } catch {
                toast.error("Fehler beim Auswählen des Inventars");
            }
        });
    }, [onSelectInventoryAction, runWithPending]);

    return {
        isSelecting: isPending,
        handleSelectInventory,
    };
}
