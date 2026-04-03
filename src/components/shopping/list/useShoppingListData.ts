"use client";

import { usePollingTableData } from "@/components/generic/datatable/usePollingTableData";
import { loadShoppingList } from "@/lib/shopping/loadList";
import { createListSignature } from "@/lib/collections/createListSignature";
import { mapToShoppingColumns } from "./addItem";
import type { ShoppingColumns } from "./columns";

const SHOPPING_LIST_POLL_INTERVAL_MS = 60_000;

function toShoppingListSignatureItem(item: ShoppingColumns) {
    return {
        id: item.id,
        name: item.name,
        count: item.count,
        unit: item.unit,
        userName: item.userName,
    };
}

export function createShoppingListSignature(items: ShoppingColumns[]): string {
    return createListSignature(items, toShoppingListSignatureItem);
}

export function useShoppingListData() {
    return usePollingTableData({
        loader: loadShoppingList,
        mapItem: mapToShoppingColumns,
        createSignature: createShoppingListSignature,
        errorMessage: "Konnte die Einkaufsartikel nicht laden.",
        pollIntervalMs: SHOPPING_LIST_POLL_INTERVAL_MS,
    });
}
