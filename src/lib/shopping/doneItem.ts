export async function markShoppingListItemDone(itemId: number): Promise<void> {
    const response = await fetch(`/api/shopping/${itemId}/done`, {
        method: "PATCH",
    });

    if (!response.ok) {
        throw new Error("Fehler beim Markieren des Einkaufsartikels als erledigt.");
    }
}
