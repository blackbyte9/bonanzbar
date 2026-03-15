
export type ShoppingListItem = {
    id: number;
    name: string;
    count: number;
    unit: string | null;
    user: {
        id?: string;
        name?: string;
    } | null;
};

export async function loadShoppingList(): Promise<ShoppingListItem[]> {
    const response = await fetch("/api/shopping", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Fehler beim Laden der Einkaufsliste.");
    }

    const payload = (await response.json()) as { shoppingList?: ShoppingListItem[] };

    return payload.shoppingList ?? [];
}
