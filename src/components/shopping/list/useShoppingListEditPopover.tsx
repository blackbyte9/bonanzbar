"use client";

import { useCallback, useEffect, useMemo, useState, type Dispatch, type MouseEvent, type ReactNode, type SetStateAction } from "react";
import type { Row } from "@tanstack/react-table";
import { toast } from "sonner";
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
import { updateShoppingListItem } from "@/lib/shopping/updateItem";
import type { ShoppingColumns } from "./columns";
import { mapToShoppingColumns } from "./addItem";
import { useShoppingItemMetadata } from "./useShoppingItemMetadata";

type UseShoppingListEditPopoverParams = {
    canEditItems: boolean;
    canMarkDone: boolean;
    shoppingItems: ShoppingColumns[];
    setErrorAction: Dispatch<SetStateAction<string | null>>;
    setShoppingItemsAction: Dispatch<SetStateAction<ShoppingColumns[]>>;
    isMarkDoneLoadingAction: (id: number) => boolean;
    onMarkDoneAction: (id: number) => Promise<void>;
};

type UseShoppingListEditPopoverResult = {
    rowClickHandler: (row: Row<ShoppingColumns>, event: MouseEvent<HTMLTableRowElement>) => void;
    editPopoverNode: ReactNode;
};

export function useShoppingListEditPopover({
    canEditItems,
    canMarkDone,
    shoppingItems,
    setErrorAction: setError,
    setShoppingItemsAction: setShoppingItems,
    isMarkDoneLoadingAction: isMarkDoneLoading,
    onMarkDoneAction: onMarkDone,
}: UseShoppingListEditPopoverParams): UseShoppingListEditPopoverResult {
    const [isEditPopoverOpen, setIsEditPopoverOpen] = useState(false);
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [popoverAnchor, setPopoverAnchor] = useState({ x: 0, y: 0 });
    const [editName, setEditName] = useState("");
    const [editCount, setEditCount] = useState("1");
    const [editUnit, setEditUnit] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const {
        presetItems,
        presetItemNames,
        units,
        loadPresetItems,
        loadUnits,
    } = useShoppingItemMetadata();

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

    const closeEditPopover = useCallback(() => {
        setIsEditPopoverOpen(false);
        setEditingItemId(null);
    }, []);

    const rowClickHandler = useCallback(
        (row: Row<ShoppingColumns>, event: MouseEvent<HTMLTableRowElement>) => {
            if (!canEditItems) {
                return;
            }

            const item = row.original;
            setEditingItemId(item.id);
            setEditName(item.name);
            setEditCount(String(item.count));
            setEditUnit(item.unit ?? "");
            setPopoverAnchor({ x: event.clientX, y: event.clientY });
            setIsEditPopoverOpen(true);
        },
        [canEditItems],
    );

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
    }, [closeEditPopover, editCount, editName, editUnit, editingItem, isSavingEdit, setError, setShoppingItems]);

    const handleMarkDoneFromPopover = useCallback(async () => {
        if (!editingItem || !canMarkDone) {
            return;
        }

        await onMarkDone(editingItem.id);
        closeEditPopover();
    }, [canMarkDone, closeEditPopover, editingItem, onMarkDone]);

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

        setEditUnit(selectedPreset.defaultUnit ?? "");
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

    const editPopoverNode = (
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
                            disabled={!editingItem || !canMarkDone || (editingItem ? isMarkDoneLoading(editingItem.id) : false)}
                        >
                            {editingItem && isMarkDoneLoading(editingItem.id) ? "Speichern..." : "Erledigt"}
                        </Button>
                        <Button type="button" variant="outline" onClick={closeEditPopover} disabled={isSavingEdit}>
                            Abbrechen
                        </Button>
                    </div>
                </form>
            </PopoverContent>
        </Popover>
    );

    return {
        rowClickHandler,
        editPopoverNode,
    };
}
