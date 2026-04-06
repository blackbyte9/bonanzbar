"use client";

import { usePollingTableData } from "@/components/generic/datatable/usePollingTableData";
import { createListSignature } from "@/lib/collections/createListSignature";
import { loadInventoryItems, type InventoryItemListItem } from "@/lib/inventory/loadItems";
import { useCallback } from "react";
import type { InventoryListColumns } from "./columns";

const INVENTORY_LIST_POLL_INTERVAL_MS = 60_000;

function mapToInventoryListColumns(item: InventoryItemListItem): InventoryListColumns {
    return {
        id: item.id,
        name: item.name,
        unit: item.unit,
        packageSize: item.packageSize,
        inventoryCount: item.inventoryCount,
        inventoryPackage: item.inventoryPackage,
        inventoryPartial: item.inventoryPartial,
        hasNoInventoryItem: item.hasNoInventoryItem,
    };
}

function toInventoryListSignatureItem(item: InventoryListColumns) {
    return {
        id: item.id,
        name: item.name,
        unit: item.unit,
        packageSize: item.packageSize,
        inventoryCount: item.inventoryCount,
        inventoryPackage: item.inventoryPackage,
        inventoryPartial: item.inventoryPartial,
        hasNoInventoryItem: item.hasNoInventoryItem,
    };
}

export function createInventoryListSignature(items: InventoryListColumns[]): string {
    return createListSignature(items, toInventoryListSignatureItem);
}

export function useInventoryListData(inventoryId: number | null) {
    const loader = useCallback(async () => {
        if (!inventoryId) {
            return [];
        }

        return loadInventoryItems(inventoryId);
    }, [inventoryId]);

    return usePollingTableData({
        loader,
        mapItem: mapToInventoryListColumns,
        createSignature: createInventoryListSignature,
        errorMessage: "Konnte die Inventurartikel nicht laden.",
        pollIntervalMs: INVENTORY_LIST_POLL_INTERVAL_MS,
    });
}
