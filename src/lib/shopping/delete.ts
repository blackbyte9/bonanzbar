export async function deleteShoppingListItem(itemId: number): Promise<void> {
    const response = await fetch(`/api/shopping/${itemId}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Fehler beim Löschen des Einkaufsartikels.");
    }
}
