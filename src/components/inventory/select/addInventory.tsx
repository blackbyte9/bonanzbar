"use client";

import { createInventory } from "@/lib/inventory/create";
import { InventoryListItem } from "@/lib/inventory/read";
import { Button } from "@/shadcn/components/ui/button";
import { Input } from "@/shadcn/components/ui/input";
import { useCallback, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { toast } from "sonner";
import type { InventoryColumns } from "./columns";

function mapToInventoryColumns(item: InventoryListItem): InventoryColumns {
    return {
        id: item.id,
        startDate: item.startDate,
        endDate: item.endDate,
        createdAt: item.createdAt,
        isActive: item.endDate === null,
    };
}

type ExecuteAddInventoryActionParams = {
    startDate: string;
    setIsAddingAction: Dispatch<SetStateAction<boolean>>;
    setErrorAction: Dispatch<SetStateAction<string | null>>;
    setInventoriesAction: Dispatch<SetStateAction<InventoryColumns[]>>;
    setStartDateAction: Dispatch<SetStateAction<string>>;
};

export async function executeAddInventoryAction({
    startDate,
    setIsAddingAction: setIsAdding,
    setErrorAction: setError,
    setInventoriesAction: setInventories,
    setStartDateAction: setStartDate,
}: ExecuteAddInventoryActionParams): Promise<boolean> {
    const trimmedStartDate = startDate.trim();

    if (!trimmedStartDate) {
        toast.error("Bitte geben Sie ein Startdatum ein.");
        setError("Bitte geben Sie ein Startdatum ein.");
        return false;
    }

    try {
        setIsAdding(true);
        setError(null);

        const inventory = await createInventory({
            startDate: trimmedStartDate,
        });

        setInventories((prev) => [mapToInventoryColumns(inventory), ...prev]);
        setStartDate("");
        toast.success("Inventar erstellt.");
        return true;
    } catch {
        toast.error("Konnte das Inventar nicht erstellen.");
        setError("Konnte das Inventar nicht erstellen.");
        return false;
    } finally {
        setIsAdding(false);
    }
}

type AddInventoryFormProps = {
    setErrorAction: Dispatch<SetStateAction<string | null>>;
    setInventoriesAction: Dispatch<SetStateAction<InventoryColumns[]>>;
};

export function AddInventoryForm({
    setErrorAction: setError,
    setInventoriesAction: setInventories,
}: AddInventoryFormProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [startDate, setStartDate] = useState("");

    const handleAddInventory = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            await executeAddInventoryAction({
                startDate,
                setIsAddingAction: setIsAdding,
                setErrorAction: setError,
                setInventoriesAction: setInventories,
                setStartDateAction: setStartDate,
            });
        },
        [startDate, setError, setInventories],
    );

    return (
        <form onSubmit={handleAddInventory} className="mb-4 flex flex-col gap-2 md:flex-row md:items-end">
            <div className="flex flex-col gap-1">
                <label htmlFor="inventory-start-date" className="text-sm font-medium">
                    Startdatum
                </label>
                <Input
                    id="inventory-start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={isAdding}
                    required
                />
            </div>

            <Button type="submit" disabled={isAdding}>
                {isAdding ? "Wird erstellt..." : "Inventar erstellen"}
            </Button>
        </form>
    );
}

export { mapToInventoryColumns };
