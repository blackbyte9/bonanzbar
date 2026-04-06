"use client";

import TablePageShell from "@/components/generic/datatable/tablePageShell";
import { AddShoppingItemForm } from "@/components/shopping/add";
import ShoppingList from "@/components/shopping/list";
import { useShoppingListData } from "@/components/shopping/list/useShoppingListData";
import { useSession } from "@/lib/auth/client";
import usePrivatePageAuth from "@/lib/auth/usePrivatePageAuth";
import { Loader2 } from "lucide-react";

const ALLOWED_ROLES = ["ADMIN", "ORGANIZER", "USER", "GUEST"] as const;

export default function ShoppingPage() {
    const { isSessionLoading, isAuthorized } =
        usePrivatePageAuth(ALLOWED_ROLES);
    const {
        data: shoppingItems,
        setData: setShoppingItems,
        isLoading,
        error,
        setError,
    } = useShoppingListData();
    const { data: session, isPending: isRoleLoading } = useSession();
    const canAddItems = !isRoleLoading && session?.user?.role !== "GUEST";

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
            <TablePageShell title="Einkaufsartikel">
                {canAddItems ? (
                    <AddShoppingItemForm
                        setErrorAction={setError}
                        setShoppingItemsAction={setShoppingItems}
                    />
                ) : null}
                <ShoppingList
                    shoppingItems={shoppingItems}
                    setShoppingItemsAction={setShoppingItems}
                    isLoading={isLoading}
                    error={error}
                    setErrorAction={setError}
                />
            </TablePageShell>
        </main>
    );
};
