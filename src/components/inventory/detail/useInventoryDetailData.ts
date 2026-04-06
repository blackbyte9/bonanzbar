"use client";

import { usePollingTableData } from "@/components/generic/datatable/usePollingTableData";
import { createListSignature } from "@/lib/collections/createListSignature";
import { loadInventoryItems, type InventoryItemListItem } from "@/lib/inventory/loadItems";
import type { InventoryDetailColumns } from "./columns";

const INVENTORY_DETAIL_POLL_INTERVAL_MS = 60_000;

function mapToInventoryDetailColumns(item: InventoryItemListItem): InventoryDetailColumns {
    return {
        id: item.id,
        name: item.name,
        unit: item.unit,
        packageSize: item.packageSize,
    };
}

function toInventoryDetailSignatureItem(item: InventoryDetailColumns) {
    return {
        id: item.id,
        name: item.name,
        unit: item.unit,
        packageSize: item.packageSize,
    };
}

export function createInventoryDetailSignature(items: InventoryDetailColumns[]): string {
    return createListSignature(items, toInventoryDetailSignatureItem);
}

export function useInventoryDetailData() {
    return usePollingTableData({
        loader: loadInventoryItems,
        mapItem: mapToInventoryDetailColumns,
        createSignature: createInventoryDetailSignature,
        errorMessage: "Konnte die Inventurartikel nicht laden.",
        pollIntervalMs: INVENTORY_DETAIL_POLL_INTERVAL_MS,
    });
}
