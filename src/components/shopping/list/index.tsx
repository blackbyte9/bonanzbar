
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GenericDataTable from "@/components/generic/datatable";
import { getColumnsForShoppingList, ShoppingColumns } from "./columns";
import { loadShoppingList } from "@/lib/shopping/loadList";
import { markShoppingListItemDone } from "@/lib/shopping/doneItem";
import { AddShoppingItemForm, mapToShoppingColumns } from "./addItem";
import { useSession } from "@/lib/auth/client";
import { toast } from "sonner";

const SHOPPING_LIST_POLL_INTERVAL_MS = 60_000;

function createShoppingListSignature(items: ShoppingColumns[]): string {
    return JSON.stringify(
        items.map((item) => ({
            id: item.id,
            name: item.name,
            count: item.count,
            unit: item.unit,
            userName: item.userName,
        })),
    );
}

export default function ShoppingList() {
    const { data: session, isPending: isSessionLoading } = useSession();
    const [shoppingItems, setShoppingItems] = useState<ShoppingColumns[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [markingDoneIds, setMarkingDoneIds] = useState<Record<number, boolean>>({});
    const latestSignatureRef = useRef("");
    const canAddItems = !isSessionLoading && session?.user?.role !== "GUEST";
    const canMarkDone = !isSessionLoading && session?.user?.role !== "GUEST";

    const isDoneLoading = useCallback(
        (id: number) => Boolean(markingDoneIds[id]),
        [markingDoneIds],
    );

    const handleMarkDone = useCallback(
        async (itemId: number) => {
            if (!canMarkDone || markingDoneIds[itemId]) {
                return;
            }

            let removedItem: ShoppingColumns | undefined;

            setMarkingDoneIds((prev) => ({
                ...prev,
                [itemId]: true,
            }));

            setShoppingItems((prev) => {
                removedItem = prev.find((item) => item.id === itemId);
                return prev.filter((item) => item.id !== itemId);
            });

            try {
                setError(null);
                await markShoppingListItemDone(itemId);
                toast.success("Erfolgreich auf erledigt gesetzt.");
            } catch {
                if (removedItem) {
                    const itemToRestore = removedItem;
                    setShoppingItems((prev) => [itemToRestore, ...prev]);
                }
                setError("Konnte den Einkaufsartikel nicht auf erledigt setzen.");
                toast.error("Konnte den Einkaufsartikel nicht auf erledigt setzen.");
            } finally {
                setMarkingDoneIds((prev) => ({
                    ...prev,
                    [itemId]: false,
                }));
            }
        },
        [canMarkDone, markingDoneIds],
    );

    const columns = useMemo(
        () =>
            getColumnsForShoppingList({
                canMarkDone,
                isDoneLoadingAction: isDoneLoading,
                onMarkDoneAction: (itemId) => {
                    void handleMarkDone(itemId);
                },
            }),
        [canMarkDone, handleMarkDone, isDoneLoading],
    );

    useEffect(() => {
        latestSignatureRef.current = createShoppingListSignature(shoppingItems);
    }, [shoppingItems]);

    useEffect(() => {
        let isMounted = true;

        async function fetchShoppingList(showLoadingState: boolean) {
            try {
                if (showLoadingState) {
                    setIsLoading(true);
                }
                setError(null);

                const list = await loadShoppingList();
                const mappedList = list.map(mapToShoppingColumns);
                const nextSignature = createShoppingListSignature(mappedList);

                if (isMounted) {
                    if (nextSignature !== latestSignatureRef.current) {
                        latestSignatureRef.current = nextSignature;
                        setShoppingItems(mappedList);
                    }
                }
            } catch {
                if (isMounted) {
                    setError("Konnte die Einkaufsartikel nicht laden.");
                }
            } finally {
                if (isMounted && showLoadingState) {
                    setIsLoading(false);
                }
            }
        }

        void fetchShoppingList(true);

        const intervalId = window.setInterval(() => {
            void fetchShoppingList(false);
        }, SHOPPING_LIST_POLL_INTERVAL_MS);

        return () => {
            isMounted = false;
            window.clearInterval(intervalId);
        };
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Einkaufsartikel</h1>

            {canAddItems ? <AddShoppingItemForm setErrorAction={setError} setShoppingItemsAction={setShoppingItems} /> : null}

            {error ? (
                <p className="text-sm text-red-500">{error}</p>
            ) : isLoading ? (
                <p className="text-sm text-muted-foreground">Lade Einkaufsartikel...</p>
            ) : (
                <GenericDataTable columns={columns} data={shoppingItems} emptyMessage="Keine Einkaufsartikel gefunden." />
            )}
        </div>
    );
}
