export type ShoppingItemPreset = {
    name: string;
    defaultUnit: string | null;
};

export async function loadShoppingItems(): Promise<ShoppingItemPreset[]> {
    const response = await fetch("/api/shopping/items", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Fehler beim Laden der Artikelvorlagen.");
    }

    const payload = (await response.json()) as { shoppingItems?: ShoppingItemPreset[] };

    return payload.shoppingItems ?? [];
}
