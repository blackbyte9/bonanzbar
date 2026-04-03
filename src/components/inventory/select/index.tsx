"use client";

import GenericDataTable from "@/components/generic/datatable";
import { getDisplayColumnsForInventoryList } from "./columns";
import TablePageShell from "@/components/generic/datatable/tablePageShell";
import { useRouter } from "next/navigation";
import { AddInventoryForm } from "./addInventory";
import { useInventorySelectData } from "./useInventorySelectData";
import { useInventorySelectAction } from "./useInventorySelectAction";

export default function InventorySelectList() {
    const {
        data: inventories,
        setData: setInventories,
        isLoading,
        error,
        setError,
    } = useInventorySelectData();
    const router = useRouter();
    const canSelect = true;

    const { isSelecting, handleSelectInventory } = useInventorySelectAction({
        // TODO: Replace redirect with API call once active-inventory selection endpoint exists.
        onSelectInventoryAction: async (inventoryId: number) => {
            router.push(`/inventory/${inventoryId}`);
        },
    });

    const columns = getDisplayColumnsForInventoryList({
        canSelect,
        onSelectAction: handleSelectInventory,
        isLoadingAction: isSelecting,
    });

    return (
        <TablePageShell title="Inventarverwaltung">
            <AddInventoryForm setErrorAction={setError} setInventoriesAction={setInventories} />
            <GenericDataTable
                columns={columns}
                data={inventories}
                isLoading={isLoading}
                error={error}
                loadingMessage="Lade Inventarverwaltung..."
                loadingVariant="skeleton"
                skeletonRowCount={5}
            />
        </TablePageShell>
    );
}
