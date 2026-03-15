"use client";

import ShoppingList from "@/components/shopping/list";
import usePrivatePageAuth from "@/lib/auth/usePrivatePageAuth";
import { Loader2 } from "lucide-react";

const ALLOWED_ROLES = ["ADMIN", "ORGANIZER", "USER", "GUEST"] as const;

export default function ShoppingPage() {
    const { isSessionLoading, isAuthorized } =
        usePrivatePageAuth(ALLOWED_ROLES);

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
        <main className="p-4">
            <ShoppingList />
        </main>
    );
};
