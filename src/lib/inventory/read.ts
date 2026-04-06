
export type InventoryListItem = {
    id: number;
    startDate: string;
    endDate: string | null;
    createdAt: Date;
};

export type ActiveInventory = {
    id: number;
    startDate: string;
    endDate: string | null;
};

export type InventoryItemListItem = {
    id: number;
    name: string;
    unit: string | null;
    packageSize: number | null;
    inventoryCount: number | null;
    inventoryPackage: number | null;
    inventoryPartial: number | null;
    inventorySum: number;
    hasNoInventoryItem: boolean;
};

export async function loadActiveInventory(): Promise<ActiveInventory | null> {
    const response = await fetch("/api/inventory", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Fehler beim Laden des aktiven Inventars.");
    }

    const payload = (await response.json()) as { activeInventory?: ActiveInventory | null };

    return payload.activeInventory ?? null;
}

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

export async function loadInventoryById(inventoryId: number): Promise<ActiveInventory | null> {
    const response = await fetch(`/api/inventory/${inventoryId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Fehler beim Laden der Inventur.");
    }

    const payload = (await response.json()) as { inventory?: ActiveInventory | null };

    return payload.inventory ?? null;
}

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
