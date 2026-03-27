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
import TablePageShell from "@/components/generic/datatable/tablePageShell";
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/shadcn/components/ui/popover";
import { Button } from "@/shadcn/components/ui/button";
import ComboboxField from "@/components/generic/form/comboboxField";
import { loadShoppingItems, ShoppingItemPreset } from "@/lib/shopping/loadItems";
import { loadShoppingUnits } from "@/lib/shopping/loadUnit";
import { updateShoppingListItem } from "@/lib/shopping/updateItem";

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
    const [isEditPopoverOpen, setIsEditPopoverOpen] = useState(false);
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [popoverAnchor, setPopoverAnchor] = useState({ x: 0, y: 0 });
    const [editName, setEditName] = useState("");
    const [editCount, setEditCount] = useState("1");
    const [editUnit, setEditUnit] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [presetItems, setPresetItems] = useState<ShoppingItemPreset[]>([]);
    const [isPresetLoading, setIsPresetLoading] = useState(false);
    const [units, setUnits] = useState<string[]>([]);
    const [isUnitLoading, setIsUnitLoading] = useState(false);
    const latestSignatureRef = useRef("");
    const canAddItems = !isSessionLoading && session?.user?.role !== "GUEST";
    const canMarkDone = !isSessionLoading && session?.user?.role !== "GUEST";
    const canEditItems = !isSessionLoading && session?.user?.role !== "GUEST";

    const presetItemNames = useMemo(
        () => presetItems.map((item) => item.name),
        [presetItems],
    );

    const selectedPreset = useMemo(() => {
        const normalizedName = editName.trim().toLocaleLowerCase();

        if (!normalizedName) {
            return null;
        }

        return presetItems.find((item) => item.name.trim().toLocaleLowerCase() === normalizedName) ?? null;
    }, [editName, presetItems]);

    const editingItem = useMemo(
        () => shoppingItems.find((item) => item.id === editingItemId) ?? null,
        [editingItemId, shoppingItems],
    );

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

    const loadPresetItems = useCallback(async () => {
        if (isPresetLoading) {
            return;
        }

        try {
            setIsPresetLoading(true);
            const loadedPresetItems = await loadShoppingItems();
            setPresetItems(loadedPresetItems);
        } catch {
            toast.error("Konnte die Artikelvorlagen nicht laden.");
        } finally {
            setIsPresetLoading(false);
        }
    }, [isPresetLoading]);

    const loadUnits = useCallback(async () => {
        if (isUnitLoading) {
            return;
        }

        try {
            setIsUnitLoading(true);
            const loadedUnits = await loadShoppingUnits();
            setUnits(loadedUnits);
        } catch {
            toast.error("Konnte die Einheiten nicht laden.");
        } finally {
            setIsUnitLoading(false);
        }
    }, [isUnitLoading]);

    const handleOpenEditPopover = useCallback(
        (item: ShoppingColumns, anchorX: number, anchorY: number) => {
            if (!canEditItems) {
                return;
            }

            setEditingItemId(item.id);
            setEditName(item.name);
            setEditCount(String(item.count));
            setEditUnit(item.unit ?? "");
            setPopoverAnchor({ x: anchorX, y: anchorY });
            setIsEditPopoverOpen(true);
        },
        [canEditItems],
    );

    const closeEditPopover = useCallback(() => {
        setIsEditPopoverOpen(false);
        setEditingItemId(null);
    }, []);

    const handleSaveEdit = useCallback(async () => {
        if (!editingItem || isSavingEdit) {
            return;
        }

        const trimmedName = editName.trim();
        const parsedCount = Number(editCount);

        if (!trimmedName) {
            toast.error("Bitte geben Sie einen Artikelnamen ein.");
            setError("Bitte geben Sie einen Artikelnamen ein.");
            return;
        }

        if (!Number.isFinite(parsedCount) || parsedCount < 0 || !Number.isInteger(parsedCount)) {
            toast.error("Die Anzahl muss eine ganze Zahl größer oder gleich 0 sein.");
            setError("Die Anzahl muss eine ganze Zahl größer oder gleich 0 sein.");
            return;
        }

        try {
            setIsSavingEdit(true);
            setError(null);

            const updatedItem = await updateShoppingListItem({
                id: editingItem.id,
                name: trimmedName,
                count: parsedCount,
                unit: editUnit.trim() || null,
            });

            const mappedItem = mapToShoppingColumns(updatedItem);
            setShoppingItems((prev) => prev.map((item) => (item.id === mappedItem.id ? mappedItem : item)));
            closeEditPopover();
            toast.success("Einkaufsartikel aktualisiert.");
        } catch {
            setError("Konnte den Einkaufsartikel nicht aktualisieren.");
            toast.error("Konnte den Einkaufsartikel nicht aktualisieren.");
        } finally {
            setIsSavingEdit(false);
        }
    }, [closeEditPopover, editCount, editName, editUnit, editingItem, isSavingEdit, setError]);

    const handleMarkDoneFromPopover = useCallback(async () => {
        if (!editingItem || !canMarkDone) {
            return;
        }

        await handleMarkDone(editingItem.id);
        closeEditPopover();
    }, [canMarkDone, closeEditPopover, editingItem, handleMarkDone]);

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
        if (!isEditPopoverOpen || !editingItemId) {
            return;
        }

        const itemStillExists = shoppingItems.some((item) => item.id === editingItemId);

        if (!itemStillExists) {
            setIsEditPopoverOpen(false);
            setEditingItemId(null);
        }
    }, [editingItemId, isEditPopoverOpen, shoppingItems]);

    useEffect(() => {
        if (!selectedPreset || !isEditPopoverOpen) {
            return;
        }

        setEditCount(String(selectedPreset.count));
        setEditUnit(selectedPreset.unit ?? "");
    }, [isEditPopoverOpen, selectedPreset]);

    useEffect(() => {
        if (!isEditPopoverOpen) {
            return;
        }

        const focusTimer = window.setTimeout(() => {
            const input = document.getElementById("shopping-edit-item-name") as HTMLInputElement | null;
            input?.focus();
            input?.select();
        }, 0);

        return () => {
            window.clearTimeout(focusTimer);
        };
    }, [isEditPopoverOpen]);

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
        <TablePageShell title="Einkaufsartikel">
            {canAddItems ? (
                <AddShoppingItemForm setErrorAction={setError} setShoppingItemsAction={setShoppingItems} />
            ) : null}

            <GenericDataTable
                columns={columns}
                data={shoppingItems}
                emptyMessage="Keine Einkaufsartikel gefunden."
                isLoading={isLoading}
                error={error}
                rowClickHandler={canEditItems ? (row, event) => {
                    handleOpenEditPopover(row.original, event.clientX, event.clientY);
                } : undefined}
                loadingMessage="Lade Einkaufsartikel..."
                loadingVariant="skeleton"
                skeletonRowCount={6}
            />

            <Popover
                open={isEditPopoverOpen}
                onOpenChange={(open) => {
                    setIsEditPopoverOpen(open);
                    if (!open) {
                        setEditingItemId(null);
                    }
                }}
            >
                <PopoverTrigger
                    className="pointer-events-none fixed h-1 w-1 opacity-0"
                    style={{
                        left: popoverAnchor.x,
                        top: popoverAnchor.y,
                    }}
                    title="Bearbeitungs-Popover öffnen"
                    aria-label="Bearbeitungs-Popover öffnen"
                >
                    Bearbeiten
                </PopoverTrigger>
                <PopoverContent className="w-[min(92vw,28rem)] p-4" sideOffset={12}>
                    <PopoverHeader className="mb-2">
                        <PopoverTitle>Artikel bearbeiten</PopoverTitle>
                        <PopoverDescription>
                            Aktualisiere Name, Anzahl und Einheit. Mit Enter speicherst du direkt.
                        </PopoverDescription>
                    </PopoverHeader>

                    <form
                        className="space-y-3"
                        onSubmit={(event) => {
                            event.preventDefault();
                            void handleSaveEdit();
                        }}
                    >
                        <ComboboxField
                            id="shopping-edit-item-name"
                            label="Name"
                            placeholder="z.B. Rum"
                            items={presetItemNames}
                            value={editName}
                            onValueChangeAction={setEditName}
                            onFocusAction={() => {
                                if (presetItems.length === 0) {
                                    void loadPresetItems();
                                }
                            }}
                            emptyMessage="Keine Artikelvorlagen gefunden."
                            disabled={isSavingEdit}
                            required
                        />

                        <div className="flex flex-col gap-1">
                            <label htmlFor="shopping-edit-item-count" className="text-sm font-medium">Anzahl</label>
                            <input
                                id="shopping-edit-item-count"
                                type="number"
                                min={0}
                                step={1}
                                className="h-9 w-full rounded-md border px-3 text-sm"
                                value={editCount}
                                onChange={(event) => setEditCount(event.target.value)}
                                disabled={isSavingEdit}
                                required
                            />
                        </div>

                        <ComboboxField
                            id="shopping-edit-item-unit"
                            label="Einheit"
                            placeholder="z.B. Stück"
                            items={units}
                            value={editUnit}
                            onValueChangeAction={setEditUnit}
                            onFocusAction={() => {
                                if (units.length === 0) {
                                    void loadUnits();
                                }
                            }}
                            emptyMessage="Keine Einheiten gefunden."
                            disabled={isSavingEdit}
                        />

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Button type="submit" disabled={isSavingEdit || !editingItem}>
                                {isSavingEdit ? "Speichern..." : "Änderungen speichern"}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => void handleMarkDoneFromPopover()}
                                disabled={!editingItem || !canMarkDone || (editingItem ? isDoneLoading(editingItem.id) : false)}
                            >
                                {editingItem && isDoneLoading(editingItem.id) ? "Speichern..." : "Erledigt"}
                            </Button>
                            <Button type="button" variant="outline" onClick={closeEditPopover} disabled={isSavingEdit}>
                                Abbrechen
                            </Button>
                        </div>
                    </form>
                </PopoverContent>
            </Popover>
        </TablePageShell>
    );
}
