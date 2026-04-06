export async function deleteInventory(inventoryId: number): Promise<void> {
    const response = await fetch(`/api/inventory/${inventoryId}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Fehler beim Löschen der Inventur.");
    }
}
