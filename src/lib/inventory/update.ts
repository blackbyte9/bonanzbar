
export type UpdateInventoryItemInput = {
    inventoryId: number;
    itemId: number;
    count: number;
    package: number;
    partial: number | null;
};

export type UpdatedInventoryItemResponse = {
    itemId: number;
    inventoryCount: number | null;
    inventoryPackage: number | null;
    inventoryPartial: number | null;
    hasNoInventoryItem: boolean;
};

export async function updateInventoryItem(input: UpdateInventoryItemInput): Promise<UpdatedInventoryItemResponse> {
    const response = await fetch(`/api/inventory/${input.inventoryId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            itemId: input.itemId,
            count: input.count,
            package: input.package,
            partial: input.partial,
        }),
    });

    if (!response.ok) {
        throw new Error("Fehler beim Aktualisieren des Inventurartikels.");
    }

    const payload = (await response.json()) as { item?: UpdatedInventoryItemResponse };

    if (!payload.item) {
        throw new Error("Fehler beim Abrufen des Inventurartikels aus der Antwort.");
    }

    return payload.item;
}
