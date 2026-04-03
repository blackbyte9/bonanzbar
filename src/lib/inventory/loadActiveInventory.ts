export type ActiveInventory = {
    id: number;
    startDate: string;
    endDate: string | null;
};

export async function loadActiveInventory(): Promise<ActiveInventory | null> {
    const response = await fetch("/api/inventory", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Fehler beim Laden des aktiven Inventars.");
    }

    const payload = (await response.json()) as { activeInventory?: ActiveInventory | null };

    return payload.activeInventory ?? null;
}
