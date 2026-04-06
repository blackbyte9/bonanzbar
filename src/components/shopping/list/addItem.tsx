"use client";

import { createShoppingListItem } from "@/lib/shopping/create";
import { ShoppingListItem } from "@/lib/shopping/read";
import { Button } from "@/shadcn/components/ui/button";
import { useEffect, useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { toast } from "sonner";
import type { ShoppingColumns } from "./columns";
import ComboboxField from "@/components/generic/form/comboboxField";
import { useShoppingItemMetadata } from "./useShoppingItemMetadata";

function mapToShoppingColumns(item: ShoppingListItem): ShoppingColumns {
    return {
        id: item.id,
        name: item.name,
        count: item.count,
        unit: item.unit,
        userName: item.user?.name ?? null,
    };
}

type ExecuteAddItemActionParams = {
    name: string;
    count: string;
    unit: string;
    setIsAddingAction: Dispatch<SetStateAction<boolean>>;
    setErrorAction: Dispatch<SetStateAction<string | null>>;
    setShoppingItemsAction: Dispatch<SetStateAction<ShoppingColumns[]>>;
    setNameAction: Dispatch<SetStateAction<string>>;
    setCountAction: Dispatch<SetStateAction<string>>;
    setUnitAction: Dispatch<SetStateAction<string>>;
};

export async function executeAddItemAction({
    name,
    count,
    unit,
    setIsAddingAction: setIsAdding,
    setErrorAction: setError,
    setShoppingItemsAction: setShoppingItems,
    setNameAction: setName,
    setCountAction: setCount,
    setUnitAction: setUnit,
}: ExecuteAddItemActionParams): Promise<boolean> {
    const trimmedName = name.trim();
    const parsedCount = Number(count);

    if (!trimmedName) {
        toast.error("Bitte geben Sie einen Artikelnamen ein.");
        setError("Bitte geben Sie einen Artikelnamen ein.");
        return false;
    }

    if (!Number.isFinite(parsedCount) || parsedCount < 0 || !Number.isInteger(parsedCount)) {
        toast.error("Die Anzahl muss eine ganze Zahl größer oder gleich 0 sein.");
        setError("Die Anzahl muss eine ganze Zahl größer oder gleich 0 sein.");
        return false;
    }

    try {
        setIsAdding(true);
        setError(null);

        const item = await createShoppingListItem({
            name: trimmedName,
            count: parsedCount,
            unit: unit.trim() || null,
        });

        setShoppingItems((prev) => [mapToShoppingColumns(item), ...prev]);
        setName("");
        setCount("1");
        setUnit("");
        toast.success("Artikel zur Einkaufsliste hinzugefügt.");
        return true;
    } catch {
        toast.error("Konnte den Einkaufsartikel nicht hinzufügen.");
        setError("Konnte den Einkaufsartikel nicht hinzufügen.");
        return false;
    } finally {
        setIsAdding(false);
    }
}

type AddShoppingItemFormProps = {
    setErrorAction: Dispatch<SetStateAction<string | null>>;
    setShoppingItemsAction: Dispatch<SetStateAction<ShoppingColumns[]>>;
};

export function AddShoppingItemForm({ setErrorAction: setError, setShoppingItemsAction: setShoppingItems }: AddShoppingItemFormProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState("");
    const [count, setCount] = useState("1");
    const [unit, setUnit] = useState("");
    const {
        presetItems,
        presetItemNames,
        units,
        loadPresetItems,
        loadUnits,
    } = useShoppingItemMetadata();

    const selectedPreset = useMemo(() => {
        const normalizedName = name.trim().toLocaleLowerCase();

        if (!normalizedName) {
            return null;
        }

        return presetItems.find((item) => item.name.trim().toLocaleLowerCase() === normalizedName) ?? null;
    }, [name, presetItems]);

    useEffect(() => {
        if (!selectedPreset) {
            return;
        }

        setTimeout(() => {
            setUnit(selectedPreset.defaultUnit ?? "");
        }, 0);
    }, [selectedPreset]);

    async function handleAddItem(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const wasAdded = await executeAddItemAction({
            name,
            count,
            unit,
            setIsAddingAction: setIsAdding,
            setErrorAction: setError,
            setShoppingItemsAction: setShoppingItems,
            setNameAction: setName,
            setCountAction: setCount,
            setUnitAction: setUnit,
        });

        if (wasAdded) {
            await Promise.all([
                loadUnits(),
                loadPresetItems(),
            ]);
        }
    }

    return (
        <form onSubmit={handleAddItem} className="mb-4 flex flex-col gap-2 md:flex-row md:items-end">
            <ComboboxField
                id="shopping-item-name"
                label="Name"
                placeholder="z.B. Rum"
                items={presetItemNames}
                value={name}
                onValueChangeAction={setName}
                onFocusAction={() => {
                    if (presetItems.length === 0) {
                        void loadPresetItems();
                    }
                }}
                emptyMessage="Keine Artikelvorlagen gefunden."
                disabled={isAdding}
                required
            />

            <div className="flex flex-col gap-1">
                <label htmlFor="shopping-item-count" className="text-sm font-medium">Anzahl</label>
                <input
                    id="shopping-item-count"
                    type="number"
                    min={0}
                    step={1}
                    className="h-9 w-28 rounded-md border px-3 text-sm"
                    value={count}
                    onChange={(event) => setCount(event.target.value)}
                    disabled={isAdding}
                    required
                />
            </div>

            <ComboboxField
                id="shopping-item-unit"
                label="Einheit"
                placeholder="z.B. Stück"
                items={units}
                value={unit}
                onValueChangeAction={setUnit}
                onFocusAction={() => {
                    if (units.length === 0) {
                        void loadUnits();
                    }
                }}
                emptyMessage="Keine Einheiten gefunden."
                disabled={isAdding}
            />

            <Button type="submit" disabled={isAdding}>
                {isAdding ? "Hinzufügen..." : "Artikel hinzufügen"}
            </Button>
        </form>
    );
}

export { mapToShoppingColumns };
