import type { ShoppingListItem } from "@/lib/shopping/read";

export type UpdateShoppingListItemInput = {
    id: number;
    name?: string;
    itemName?: string;
    item?: {
        name?: string;
    } | null;
    count: number;
    unit?: string | null;
};

function resolveInputItemName(input: UpdateShoppingListItemInput): string {
    const directName = typeof input.name === "string" ? input.name.trim() : "";

    if (directName) {
        return directName;
    }

    const explicitItemName = typeof input.itemName === "string" ? input.itemName.trim() : "";

    if (explicitItemName) {
        return explicitItemName;
    }

    const relationName = typeof input.item?.name === "string" ? input.item.name.trim() : "";

    if (relationName) {
        return relationName;
    }

    return "";
}

export async function updateShoppingListItem(input: UpdateShoppingListItemInput): Promise<ShoppingListItem> {
    const name = resolveInputItemName(input);

    if (!name) {
        throw new Error("Fehler beim Ermitteln des Artikelnamens.");
    }

    const response = await fetch(`/api/shopping/${input.id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
            count: input.count,
            unit: input.unit ?? null,
        }),
    });

    if (!response.ok) {
        throw new Error("Fehler beim Aktualisieren des Einkaufsartikels.");
    }

    const payload = (await response.json()) as { item?: ShoppingListItem };

    if (!payload.item) {
        throw new Error("Fehler beim Abrufen des Einkaufsartikels aus der Antwort.");
    }

    return payload.item;
}

export async function markShoppingListItemDone(itemId: number): Promise<void> {
    const response = await fetch(`/api/shopping/${itemId}/done`, {
        method: "PATCH",
    });

    if (!response.ok) {
        throw new Error("Fehler beim Markieren des Einkaufsartikels als erledigt.");
    }
}
