import type { Dispatch, SetStateAction } from "react";

export type ShoppingColumns = {
    id: number;
    name: string;
    count: number;
    unit: string | null;
    userName: string | null;
};

export type SetShoppingItemsAction = Dispatch<SetStateAction<ShoppingColumns[]>>;
export type SetShoppingErrorAction = Dispatch<SetStateAction<string | null>>;
