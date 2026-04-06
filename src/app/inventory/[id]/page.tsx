"use client";

import InventoryDetail from "@/components/inventory/detail";
import InventoryList from "@/components/inventory/list";
import usePrivatePageAuth from "@/lib/auth/usePrivatePageAuth";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

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

    return <main className="w-full">
        <InventoryDetail />
        <InventoryList inventoryId={inventoryId} />
    </main>;
};
