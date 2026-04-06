import type { ShoppingListItem } from "@/lib/shopping/read";
import type { ShoppingColumns } from "@/components/shopping/types";

export function mapToShoppingColumns(item: ShoppingListItem): ShoppingColumns {
    return {
        id: item.id,
        name: item.name,
        count: item.count,
        unit: item.unit,
        userName: item.user?.name ?? null,
    };
}
