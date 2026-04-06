"use client";

import TablePageShell from "@/components/generic/datatable/tablePageShell";
import type { ActiveInventory } from "@/lib/inventory/read";
import { completeInventory } from "@/lib/inventory/update";
import { Button } from "@/shadcn/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const inventoryDateFormatter = new Intl.DateTimeFormat("de-DE");

function formatInventoryDate(date: string | null): string {
    if (!date) {
        return "Offen";
    }

    return inventoryDateFormatter.format(new Date(date));
}

type InventoryDetailProps = {
    activeInventory: ActiveInventory | null;
    isInventoryLoading: boolean;
};

export default function InventoryDetail({ activeInventory, isInventoryLoading }: InventoryDetailProps) {
    const [isCompleting, setIsCompleting] = useState(false);
    const router = useRouter();

    async function handleCompleteInventory() {
        if (!activeInventory || isCompleting) {
            return;
        }

        setIsCompleting(true);

        try {
            await completeInventory(activeInventory.id);
            toast.success("Inventur erfolgreich abgeschlossen.");
            router.push("/inventory/select");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Fehler beim Abschließen der Inventur.");
        } finally {
            setIsCompleting(false);
        }
    }

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

            <div className="mb-6 flex flex-wrap gap-2">
                <Button onClick={() => {
                    if (activeInventory) {
                        window.location.href = `/inventory/select`;
                    }
                }}>
                    Inventur wechseln
                </Button>
                {activeInventory && activeInventory.endDate === null ? (
                    <Button
                        variant="destructive"
                        onClick={() => void handleCompleteInventory()}
                        disabled={isCompleting}
                    >
                        {isCompleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Abschließen...
                            </>
                        ) : (
                            "Inventur abschließen"
                        )}
                    </Button>
                ) : null}
            </div>
        </TablePageShell>
    );
}
