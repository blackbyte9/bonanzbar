"use client";

import TablePageShell from "@/components/generic/datatable/tablePageShell";
import { loadActiveInventory, type ActiveInventory } from "@/lib/inventory/read";
import { Button } from "@/shadcn/components/ui/button";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const inventoryDateFormatter = new Intl.DateTimeFormat("de-DE");

function formatInventoryDate(date: string | null): string {
    if (!date) {
        return "Offen";
    }

    return inventoryDateFormatter.format(new Date(date));
}

export default function InventoryDetail() {
    const [activeInventory, setActiveInventory] = useState<ActiveInventory | null>(null);
    const [isInventoryLoading, setIsInventoryLoading] = useState(true);

    useEffect(() => {
        const fetchActiveInventory = async () => {
            try {
                const inventory = await loadActiveInventory();

                setActiveInventory(inventory);
            } catch {
                toast.error("Konnte die aktive Inventur nicht laden.");
            } finally {
                setIsInventoryLoading(false);
            }
        };

        fetchActiveInventory();
    }, []);

    if (isInventoryLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <TablePageShell title="Inventurdetails">
            <section className="mb-6 rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Aktive Inventur</p>
                {activeInventory ? (
                    <>
                        <h1 className="mt-2 text-2xl font-semibold">Inventur #{activeInventory.id}</h1>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Startdatum</p>
                                <p className="font-medium">{formatInventoryDate(activeInventory.startDate)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Enddatum</p>
                                <p className="font-medium">{formatInventoryDate(activeInventory.endDate)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="font-medium">{activeInventory.endDate === null ? "Aktiv" : "Abgeschlossen"}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="mt-2 text-sm text-muted-foreground">Keine aktive Inventur gefunden.</p>
                )}
            </section>

            <div className="mb-6">
                <Button onClick={() => {
                    if (activeInventory) {
                        window.location.href = `/inventory/select`;
                    }
                }}>
                    Inventur wechseln
                </Button>
            </div>
        </TablePageShell>
    );
}
