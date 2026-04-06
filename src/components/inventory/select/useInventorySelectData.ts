"use client";

import { usePollingTableData } from "@/components/generic/datatable/usePollingTableData";
import { createListSignature } from "@/lib/collections/createListSignature";
import { loadInventoryList } from "@/lib/inventory/read";
import { mapToInventoryColumns } from "@/components/inventory/add";
import type { InventoryColumns } from "./columns";

const INVENTORY_POLL_INTERVAL_MS = 60_000;

function toInventorySignatureItem(item: InventoryColumns) {
    return {
        id: item.id,
        startDate: item.startDate,
        endDate: item.endDate,
        isActive: item.isActive,
    };
}

export function createInventorySignature(items: InventoryColumns[]): string {
    return createListSignature(items, toInventorySignatureItem);
}

export function useInventorySelectData() {
    return usePollingTableData({
        loader: loadInventoryList,
        mapItem: mapToInventoryColumns,
        createSignature: createInventorySignature,
        errorMessage: "Fehler beim Laden",
        pollIntervalMs: INVENTORY_POLL_INTERVAL_MS,
    });
}
