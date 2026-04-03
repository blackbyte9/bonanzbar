"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { loadShoppingItems, type ShoppingItemPreset } from "@/lib/shopping/loadItems";
import { loadShoppingUnits } from "@/lib/shopping/loadUnit";

type UseShoppingItemMetadataResult = {
    presetItems: ShoppingItemPreset[];
    presetItemNames: string[];
    units: string[];
    loadPresetItems: () => Promise<void>;
    loadUnits: () => Promise<void>;
};

export function useShoppingItemMetadata(): UseShoppingItemMetadataResult {
    const [presetItems, setPresetItems] = useState<ShoppingItemPreset[]>([]);
    const [isPresetLoading, setIsPresetLoading] = useState(false);
    const [units, setUnits] = useState<string[]>([]);
    const [isUnitLoading, setIsUnitLoading] = useState(false);

    const presetItemNames = useMemo(
        () => presetItems.map((item) => item.name),
        [presetItems],
    );

    const loadPresetItems = useCallback(async () => {
        if (isPresetLoading) {
            return;
        }

        try {
            setIsPresetLoading(true);
            const loadedPresetItems = await loadShoppingItems();
            setPresetItems(loadedPresetItems);
        } catch {
            toast.error("Konnte die Artikelvorlagen nicht laden.");
        } finally {
            setIsPresetLoading(false);
        }
    }, [isPresetLoading]);

    const loadUnits = useCallback(async () => {
        if (isUnitLoading) {
            return;
        }

        try {
            setIsUnitLoading(true);
            const loadedUnits = await loadShoppingUnits();
            setUnits(loadedUnits);
        } catch {
            toast.error("Konnte die Einheiten nicht laden.");
        } finally {
            setIsUnitLoading(false);
        }
    }, [isUnitLoading]);

    return {
        presetItems,
        presetItemNames,
        units,
        loadPresetItems,
        loadUnits,
    };
}
