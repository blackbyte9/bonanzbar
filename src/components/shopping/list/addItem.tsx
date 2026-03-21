"use client";

import { ShoppingListItem } from "@/lib/shopping/loadList";
import { createShoppingListItem } from "@/lib/shopping/createItem";
import { loadShoppingUnits } from "@/lib/shopping/loadUnit";
import { Button } from "@/shadcn/components/ui/button";
import { useCallback, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { toast } from "sonner";
import type { ShoppingColumns } from "./columns";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/shadcn/components/ui/combobox";

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
    const [units, setUnits] = useState<string[]>([]);
    const [isUnitLoading, setIsUnitLoading] = useState(false);

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
            await loadUnits();
        }
    }

    return (
        <form onSubmit={handleAddItem} className="mb-4 flex flex-col gap-2 md:flex-row md:items-end">
            <div className="flex flex-col gap-1">
                <label htmlFor="shopping-item-name" className="text-sm font-medium">Name</label>
                <input
                    id="shopping-item-name"
                    type="text"
                    className="h-9 rounded-md border px-3 text-sm"
                    placeholder="z.B. Rum"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={isAdding}
                    required
                />
            </div>

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

            <div className="flex flex-col gap-1">
                <label htmlFor="shopping-item-unit" className="text-sm font-medium">Einheit</label>
                <Combobox items={units}>
                    <ComboboxInput
                        placeholder="z.B. Stück"
                        value={unit}
                        onChange={(event) => setUnit(event.target.value)}
                        onFocus={() => {
                            if (units.length === 0) {
                                void loadUnits();
                            }
                        }}
                        disabled={isAdding}
                        className="h-9 rounded-md border px-3 text-sm"
                    />
                    <ComboboxContent>
                        <ComboboxEmpty className="p-2 text-sm text-muted-foreground">Keine Einheiten gefunden.</ComboboxEmpty>
                        <ComboboxList>
                            {(item) => (
                                <ComboboxItem key={item} value={item}>
                                    {item}
                                </ComboboxItem>
                            )}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </div>

            <Button type="submit" disabled={isAdding}>
                {isAdding ? "Hinzufügen..." : "Artikel hinzufügen"}
            </Button>
        </form>
    );
}

export { mapToShoppingColumns };
