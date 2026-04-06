export type InventoryItemListItem = {
    id: number;
    name: string;
    unit: string | null;
    packageSize: number | null;
};

export async function loadInventoryItems(): Promise<InventoryItemListItem[]> {
    const response = await fetch("/api/inventory/items", {
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
