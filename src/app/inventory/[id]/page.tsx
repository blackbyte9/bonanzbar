"use client";

import InventoryDetail from "@/components/inventory/detail";
import InventoryList from "@/components/inventory/list";
import { loadInventoryById, type ActiveInventory } from "@/lib/inventory/read";
import usePrivatePageAuth from "@/lib/auth/usePrivatePageAuth";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

const ALLOWED_ROLES = ["ADMIN", "ORGANIZER", "USER"] as const;

export default function InventoryPage() {
    const params = useParams<{ id?: string | string[] }>();
    const { isSessionLoading, isAuthorized } =
        usePrivatePageAuth(ALLOWED_ROLES);

    const rawId = params?.id;
    const parsedInventoryId = Number(Array.isArray(rawId) ? rawId[0] : rawId);
    const inventoryId = Number.isInteger(parsedInventoryId) && parsedInventoryId > 0
        ? parsedInventoryId
        : null;

    const [activeInventory, setActiveInventory] = useState<ActiveInventory | null>(null);
    const [isInventoryLoading, setIsInventoryLoading] = useState(true);

    useEffect(() => {
        if (!inventoryId) {
            setIsInventoryLoading(false);
            return;
        }

        const fetchInventory = async () => {
            try {
                const inventory = await loadInventoryById(inventoryId);
                setActiveInventory(inventory);
            } catch {
                toast.error("Konnte die Inventur nicht laden.");
            } finally {
                setIsInventoryLoading(false);
            }
        };

        fetchInventory();
    }, [inventoryId]);

    const isReadOnly = !isInventoryLoading && activeInventory?.endDate !== null;

    if (isSessionLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return (
        <main className="w-full">
            <InventoryDetail activeInventory={activeInventory} isInventoryLoading={isInventoryLoading} />
            <InventoryList inventoryId={inventoryId} isReadOnly={isReadOnly} />
        </main>
    );
};
