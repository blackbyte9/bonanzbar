"use client";

import usePrivatePageAuth from "@/lib/auth/usePrivatePageAuth";
import { loadActiveInventory } from "@/lib/inventory/loadActiveInventory";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ALLOWED_ROLES = ["ADMIN", "ORGANIZER", "USER", "GUEST"] as const;

export default function InventoryMainPage() {
    const { isSessionLoading, isAuthorized } =
        usePrivatePageAuth(ALLOWED_ROLES);
    const router = useRouter();
    const [isCheckingInventory, setIsCheckingInventory] = useState(true);

    useEffect(() => {
        const checkActiveInventory = async () => {
            if (!isSessionLoading && isAuthorized) {
                try {
                    const activeInventory = await loadActiveInventory();

                    if (!activeInventory) {
                        router.push("/inventory/select");
                    }
                } catch {
                    toast.error("Konnte das aktive Inventar nicht laden.");
                } finally {
                    setIsCheckingInventory(false);
                }
            }
        };

        checkActiveInventory();
    }, [isSessionLoading, isAuthorized, router]);

    if (isSessionLoading || isCheckingInventory) {
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
            Inventory
        </main>
    );
}
