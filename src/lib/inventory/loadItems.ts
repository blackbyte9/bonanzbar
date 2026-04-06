export type InventoryItemListItem = {
    id: number;
    name: string;
    unit: string | null;
    packageSize: number | null;
    inventoryCount: number | null;
    inventoryPackage: number | null;
    inventoryPartial: number | null;
    hasNoInventoryItem: boolean;
};

export async function loadInventoryItems(inventoryId: number): Promise<InventoryItemListItem[]> {
    const response = await fetch(`/api/inventory/${inventoryId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Fehler beim Laden der Inventurartikel.");
    }

    const payload = (await response.json()) as { items?: InventoryItemListItem[] };

    return payload.items ?? [];
}
