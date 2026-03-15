import { ShoppingListItem } from "@/lib/shopping/loadList";

export type CreateShoppingListItemInput = {
    name: string;
    count: number;
    unit?: string | null;
};

export async function createShoppingListItem(input: CreateShoppingListItemInput): Promise<ShoppingListItem> {
    const response = await fetch("/api/shopping", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        throw new Error("Failed to add shopping item.");
    }

    const payload = (await response.json()) as { item?: ShoppingListItem };

    if (!payload.item) {
        throw new Error("Missing shopping item in response.");
    }

    return payload.item;
}
