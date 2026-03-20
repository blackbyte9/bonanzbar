"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CellContext, ColumnDef } from "@tanstack/react-table";
import GenericDataTable from "@/components/generic/datatable";
import { useTableDataLoader } from "@/components/generic/datatable/useTableDataLoader";
import { getColumnsForShoppingList, ShoppingColumns } from "./columns";
import { loadShoppingList } from "@/lib/shopping/loadList";
import { markShoppingListItemDone } from "@/lib/shopping/doneItem";
import { AddShoppingItemForm, mapToShoppingColumns } from "./addItem";
import { useSession } from "@/lib/auth/client";
import { toast } from "sonner";

const SHOPPING_LIST_POLL_INTERVAL_MS = 60_000;
const SMALL_DISPLAY_MEDIA_QUERY = "(max-width: 640px)";

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
    const { isLoading, error, setError, runWithTableLoading } = useTableDataLoader();
    const [markingDoneIds, setMarkingDoneIds] = useState<Record<number, boolean>>({});
    const [isSmallDisplay, setIsSmallDisplay] = useState(false);
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
        [canMarkDone, markingDoneIds, setError],
    );

    const columns = useMemo(() => {
        const allColumns = getColumnsForShoppingList({
            canMarkDone,
            isDoneLoadingAction: isDoneLoading,
            onMarkDoneAction: (itemId) => {
                void handleMarkDone(itemId);
            },
        });

        if (!isSmallDisplay) {
            return allColumns;
        }

        return allColumns
            .filter((column) => {
                if ("accessorKey" in column && column.accessorKey === "userName") {
                    return false;
                }
                if ("id" in column && column.id === "userName") {
                    return false;
                }
                return true;
            })
            .map((column): ColumnDef<ShoppingColumns> => {
                const accessorKey = "accessorKey" in column ? column.accessorKey : undefined;
                const columnId = "id" in column ? column.id : undefined;

                if (accessorKey === "name" || columnId === "name") {
                    return {
                        ...column,
                        cell: (info: CellContext<ShoppingColumns, unknown>) => (
                            <span className="block w-full whitespace-normal wrap-break-word leading-snug">
                                {info.row.original.name}
                            </span>
                        ),
                    };
                }

                return column;
            });
    }, [canMarkDone, handleMarkDone, isDoneLoading, isSmallDisplay]);

    useEffect(() => {
        const mediaQuery = window.matchMedia(SMALL_DISPLAY_MEDIA_QUERY);

        const handleChange = () => {
            setIsSmallDisplay(mediaQuery.matches);
        };

        handleChange();
        mediaQuery.addEventListener("change", handleChange);

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, []);

    useEffect(() => {
        latestSignatureRef.current = createShoppingListSignature(shoppingItems);
    }, [shoppingItems]);

    useEffect(() => {
        async function fetchShoppingList(showLoadingState: boolean) {
            const list = await runWithTableLoading({
                loader: loadShoppingList,
                errorMessage: "Konnte die Einkaufsartikel nicht laden.",
                showLoading: showLoadingState,
            });

            if (list) {
                const mappedList = list.map(mapToShoppingColumns);
                const nextSignature = createShoppingListSignature(mappedList);

                if (nextSignature !== latestSignatureRef.current) {
                    latestSignatureRef.current = nextSignature;
                    setShoppingItems(mappedList);
                }
            }
        }

        void fetchShoppingList(true);

        const intervalId = window.setInterval(() => {
            void fetchShoppingList(false);
        }, SHOPPING_LIST_POLL_INTERVAL_MS);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [runWithTableLoading]);

    return (
        <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen py-4 sm:static sm:left-auto sm:right-auto sm:mx-0 sm:w-full sm:px-4">
            <h1 className="mb-4 px-4 text-2xl font-bold sm:px-0">Einkaufsartikel</h1>

            {canAddItems ? (
                <div className="w-full px-4 sm:px-0">
                    <AddShoppingItemForm setErrorAction={setError} setShoppingItemsAction={setShoppingItems} />
                </div>
            ) : null}

            <div className="w-full px-4 sm:px-0">
                <GenericDataTable
                    columns={columns}
                    data={shoppingItems}
                    emptyMessage="Keine Einkaufsartikel gefunden."
                    isLoading={isLoading}
                    error={error}
                    loadingMessage="Lade Einkaufsartikel..."
                    loadingVariant="skeleton"
                    skeletonRowCount={6}
                />
            </div>
        </div>
    );
}
