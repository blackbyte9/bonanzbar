"use client";

import type { Row } from "@tanstack/react-table";
import { Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type Dispatch, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent, type ReactNode, type SetStateAction } from "react";
import { toast } from "sonner";
import { Button } from "@/shadcn/components/ui/button";
import { Input } from "@/shadcn/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/shadcn/components/ui/sheet";
import { updateInventoryItem } from "@/lib/inventory/update";
import type { InventoryListColumns } from "./columns";

type UseInventoryListEditSheetParams = {
    inventoryId: number | null;
    inventoryItems: InventoryListColumns[];
    setErrorAction: Dispatch<SetStateAction<string | null>>;
    setInventoryItemsAction: Dispatch<SetStateAction<InventoryListColumns[]>>;
};

type UseInventoryListEditSheetResult = {
    rowClickHandler: (row: Row<InventoryListColumns>, event: MouseEvent<HTMLTableRowElement>) => void;
    editSheetNode: ReactNode;
};

function parseIntInput(value: string): number | null {
    if (!value.trim()) {
        return null;
    }

    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue < 0) {
        return null;
    }

    return parsedValue;
}

function parsePartialInput(value: string): number | null {
    if (!value.trim()) {
        return null;
    }

    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue)) {
        return null;
    }

    return parsedValue;
}

export function useInventoryListEditSheet({
    inventoryId,
    inventoryItems,
    setErrorAction: setError,
    setInventoryItemsAction: setInventoryItems,
}: UseInventoryListEditSheetParams): UseInventoryListEditSheetResult {
    const [isOpen, setIsOpen] = useState(false);
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [countValue, setCountValue] = useState("0");
    const [packageValue, setPackageValue] = useState("0");
    const [partialValue, setPartialValue] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const editingItem = useMemo(
        () => inventoryItems.find((item) => item.id === editingItemId) ?? null,
        [editingItemId, inventoryItems],
    );

    const closeSheet = useCallback(() => {
        setIsOpen(false);
        setEditingItemId(null);
    }, []);

    const rowClickHandler = useCallback((row: Row<InventoryListColumns>) => {
        const item = row.original;
        setEditingItemId(item.id);
        setCountValue(String(item.inventoryCount ?? 0));
        setPackageValue(String(item.inventoryPackage ?? 0));
        setPartialValue(item.inventoryPartial === null ? "" : String(item.inventoryPartial));
        setIsOpen(true);
    }, []);

    const changeIntegerValue = useCallback((setter: Dispatch<SetStateAction<string>>, delta: number) => {
        setter((prev) => {
            const parsedValue = parseIntInput(prev);
            const safeValue = parsedValue ?? 0;
            const nextValue = Math.max(0, safeValue + delta);

            return String(nextValue);
        });
    }, []);

    const handleIntegerFieldKeyDown = useCallback((
        event: ReactKeyboardEvent<HTMLInputElement>,
        setter: Dispatch<SetStateAction<string>>,
    ) => {
        if (event.key === "ArrowUp") {
            event.preventDefault();
            changeIntegerValue(setter, 1);
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            changeIntegerValue(setter, -1);
        }
    }, [changeIntegerValue]);

    const handleSave = useCallback(async () => {
        if (!editingItem || !inventoryId || isSaving) {
            return;
        }

        const parsedCount = parseIntInput(countValue);
        const parsedPackage = parseIntInput(packageValue);
        const parsedPartial = parsePartialInput(partialValue);

        if (parsedCount === null) {
            toast.error("Anzahl muss eine ganze Zahl größer oder gleich 0 sein.");
            setError("Anzahl muss eine ganze Zahl größer oder gleich 0 sein.");
            return;
        }

        if (parsedPackage === null) {
            toast.error("Packungen muss eine ganze Zahl größer oder gleich 0 sein.");
            setError("Packungen muss eine ganze Zahl größer oder gleich 0 sein.");
            return;
        }

        if (partialValue.trim() && parsedPartial === null) {
            toast.error("Teilmenge muss eine gültige Zahl sein.");
            setError("Teilmenge muss eine gültige Zahl sein.");
            return;
        }

        try {
            setIsSaving(true);
            setError(null);

            const savedItem = await updateInventoryItem({
                inventoryId,
                itemId: editingItem.id,
                count: parsedCount,
                package: parsedPackage,
                partial: parsedPartial,
            });

            setInventoryItems((prev) => prev.map((item) => (
                item.id === savedItem.itemId
                    ? {
                        ...item,
                        inventoryCount: savedItem.inventoryCount,
                        inventoryPackage: savedItem.inventoryPackage,
                        inventoryPartial: savedItem.inventoryPartial,
                        inventorySum: savedItem.inventorySum,
                        hasNoInventoryItem: savedItem.hasNoInventoryItem,
                    }
                    : item
            )));

            toast.success("Inventurwerte gespeichert.");
            closeSheet();
        } catch {
            setError("Konnte die Inventurwerte nicht speichern.");
            toast.error("Konnte die Inventurwerte nicht speichern.");
        } finally {
            setIsSaving(false);
        }
    }, [closeSheet, countValue, editingItem, inventoryId, isSaving, packageValue, partialValue, setError, setInventoryItems]);

    const handleModalKeyDown = useCallback((event: ReactKeyboardEvent<HTMLFormElement>) => {
        if (event.key === "Enter" && event.ctrlKey) {
            event.preventDefault();
            void handleSave();
        }
    }, [handleSave]);

    useEffect(() => {
        if (!isOpen || !editingItemId) {
            return;
        }

        const itemStillExists = inventoryItems.some((item) => item.id === editingItemId);

        if (!itemStillExists) {
            closeSheet();
        }
    }, [closeSheet, editingItemId, inventoryItems, isOpen]);

    const editSheetNode = (
        <Sheet
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) {
                    setEditingItemId(null);
                }
            }}
        >
            <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Inventurwerte bearbeiten</SheetTitle>
                    <SheetDescription>
                        {editingItem ? editingItem.name : "Werte für diesen Artikel aktualisieren."}
                    </SheetDescription>
                </SheetHeader>

                <form
                    className="space-y-4 px-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        void handleSave();
                    }}
                    onKeyDown={handleModalKeyDown}
                >
                    <div className="space-y-2">
                        <label htmlFor="inventory-edit-package" className="text-sm font-medium">Packungen</label>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                size="icon-sm"
                                variant="outline"
                                onClick={() => changeIntegerValue(setPackageValue, -1)}
                                disabled={isSaving}
                            >
                                <Minus />
                                <span className="sr-only">Packungen verringern</span>
                            </Button>
                            <Input
                                id="inventory-edit-package"
                                type="number"
                                min={0}
                                step={1}
                                value={packageValue}
                                onChange={(event) => setPackageValue(event.target.value)}
                                onKeyDown={(event) => handleIntegerFieldKeyDown(event, setPackageValue)}
                                disabled={isSaving}
                                required
                            />
                            <Button
                                type="button"
                                size="icon-sm"
                                variant="outline"
                                onClick={() => changeIntegerValue(setPackageValue, 1)}
                                disabled={isSaving}
                            >
                                <Plus />
                                <span className="sr-only">Packungen erhöhen</span>
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="inventory-edit-count" className="text-sm font-medium">Anzahl</label>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                size="icon-sm"
                                variant="outline"
                                onClick={() => changeIntegerValue(setCountValue, -1)}
                                disabled={isSaving}
                            >
                                <Minus />
                                <span className="sr-only">Anzahl verringern</span>
                            </Button>
                            <Input
                                id="inventory-edit-count"
                                type="number"
                                min={0}
                                step={1}
                                value={countValue}
                                onChange={(event) => setCountValue(event.target.value)}
                                onKeyDown={(event) => handleIntegerFieldKeyDown(event, setCountValue)}
                                disabled={isSaving}
                                required
                            />
                            <Button
                                type="button"
                                size="icon-sm"
                                variant="outline"
                                onClick={() => changeIntegerValue(setCountValue, 1)}
                                disabled={isSaving}
                            >
                                <Plus />
                                <span className="sr-only">Anzahl erhöhen</span>
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="inventory-edit-partial" className="text-sm font-medium">Teilmenge</label>
                        <Input
                            id="inventory-edit-partial"
                            type="number"
                            step="any"
                            value={partialValue}
                            onChange={(event) => setPartialValue(event.target.value)}
                            disabled={isSaving}
                        />
                    </div>

                    <SheetFooter className="px-0">
                        <Button type="submit" disabled={isSaving || !editingItem || !inventoryId}>
                            {isSaving ? "Speichern..." : "Speichern"}
                        </Button>
                        <Button type="button" variant="outline" onClick={closeSheet} disabled={isSaving}>
                            Abbrechen
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );

    return {
        rowClickHandler,
        editSheetNode,
    };
}
