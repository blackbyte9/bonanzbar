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
