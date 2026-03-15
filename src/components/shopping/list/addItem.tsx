"use client";

import { ShoppingListItem } from "@/lib/shopping/loadList";
import { createShoppingListItem } from "@/lib/shopping/createItem";
import { Button } from "@/shadcn/components/ui/button";
import { useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { toast } from "sonner";
import type { ShoppingColumns } from "./columns";

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
}: ExecuteAddItemActionParams): Promise<void> {
    const trimmedName = name.trim();
    const parsedCount = Number(count);

    if (!trimmedName) {
        toast.error("Please enter an item name.");
        setError("Please enter an item name.");
        return;
    }

    if (!Number.isFinite(parsedCount) || parsedCount < 0 || !Number.isInteger(parsedCount)) {
        toast.error("Count must be a whole number equal to or greater than 0.");
        setError("Count must be a whole number equal to or greater than 0.");
        return;
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
        toast.success("Item added to shopping list.");
    } catch {
        toast.error("Could not add shopping item.");
        setError("Could not add shopping item.");
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

    async function handleAddItem(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        await executeAddItemAction({
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
    }

    return (
        <form onSubmit={handleAddItem} className="mb-4 flex flex-col gap-2 md:flex-row md:items-end">
            <div className="flex flex-col gap-1">
                <label htmlFor="shopping-item-name" className="text-sm font-medium">Name</label>
                <input
                    id="shopping-item-name"
                    type="text"
                    className="h-9 rounded-md border px-3 text-sm"
                    placeholder="e.g. Milk"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={isAdding}
                    required
                />
            </div>

            <div className="flex flex-col gap-1">
                <label htmlFor="shopping-item-count" className="text-sm font-medium">Count</label>
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
                <label htmlFor="shopping-item-unit" className="text-sm font-medium">Unit</label>
                <input
                    id="shopping-item-unit"
                    type="text"
                    className="h-9 rounded-md border px-3 text-sm"
                    placeholder="e.g. pcs"
                    value={unit}
                    onChange={(event) => setUnit(event.target.value)}
                    disabled={isAdding}
                />
            </div>

            <Button type="submit" disabled={isAdding}>
                {isAdding ? "Adding..." : "Add Item"}
            </Button>
        </form>
    );
}

export { mapToShoppingColumns };
