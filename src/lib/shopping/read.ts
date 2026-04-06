export type ShoppingListItem = {
    id: number;
    itemId: number | null;
    name: string;
    item?: {
        name?: string;
    } | null;
    count: number;
    unit: string | null;
    user: {
        id?: string;
        name?: string;
    } | null;
};

export type ShoppingItemPreset = {
    name: string;
    defaultUnit: string | null;
};

function resolveShoppingItemName(item: ShoppingListItem): string {
    const directName = typeof item.name === "string" ? item.name.trim() : "";

    if (directName) {
        return directName;
    }

    const relationName = typeof item.item?.name === "string" ? item.item.name.trim() : "";

    if (relationName) {
        return relationName;
    }

    return "Unbekannter Artikel";
}

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

    return (payload.shoppingList ?? []).map((item) => ({
        ...item,
        name: resolveShoppingItemName(item),
    }));
}

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

export async function loadShoppingUnits(): Promise<string[]> {
    const response = await fetch("/api/shopping/units", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Fehler beim Laden der Einheiten.");
    }

    const payload = (await response.json()) as { units?: string[] };

    return payload.units ?? [];
}
