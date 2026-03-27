import { ShoppingListItem } from "@/lib/shopping/loadList";

export type UpdateShoppingListItemInput = {
    id: number;
    name: string;
    count: number;
    unit?: string | null;
};

export async function updateShoppingListItem(input: UpdateShoppingListItemInput): Promise<ShoppingListItem> {
    const response = await fetch(`/api/shopping/${input.id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: input.name,
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
