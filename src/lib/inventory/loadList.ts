export type InventoryListItem = {
    id: number;
    startDate: string;
    endDate: string | null;
    createdAt: Date;
};

export async function loadInventoryList(): Promise<InventoryListItem[]> {
    const response = await fetch("/api/inventory/list", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Fehler beim Laden der Inventarverwaltung.");
    }

    const payload = (await response.json()) as { inventories?: InventoryListItem[] };

    return payload.inventories ?? [];
}
