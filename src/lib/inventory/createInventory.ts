import { InventoryListItem } from "@/lib/inventory/loadList";

export type CreateInventoryInput = {
    startDate: string;
};

export async function createInventory(input: CreateInventoryInput): Promise<InventoryListItem> {
    const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        throw new Error("Fehler beim Erstellen des Inventars.");
    }

    const payload = (await response.json()) as { inventory?: InventoryListItem };

    if (!payload.inventory) {
        throw new Error("Fehler beim Abrufen des Inventars aus der Antwort.");
    }

    return payload.inventory;
}
