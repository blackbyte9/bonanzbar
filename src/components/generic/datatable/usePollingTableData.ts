import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { useTableDataLoader } from "./useTableDataLoader";

type UsePollingTableDataParams<TLoadedItem, TMappedItem> = {
    loader: () => Promise<TLoadedItem[]>;
    mapItem: (item: TLoadedItem) => TMappedItem;
    createSignature: (items: TMappedItem[]) => string;
    errorMessage: string;
    pollIntervalMs: number;
};

type UsePollingTableDataResult<TMappedItem> = {
    data: TMappedItem[];
    setData: Dispatch<SetStateAction<TMappedItem[]>>;
    isLoading: boolean;
    error: string | null;
    setError: Dispatch<SetStateAction<string | null>>;
};

export function usePollingTableData<TLoadedItem, TMappedItem>({
    loader,
    mapItem,
    createSignature,
    errorMessage,
    pollIntervalMs,
}: UsePollingTableDataParams<TLoadedItem, TMappedItem>): UsePollingTableDataResult<TMappedItem> {
    const [data, setData] = useState<TMappedItem[]>([]);
    const latestSignatureRef = useRef("");
    const { isLoading, error, setError, runWithTableLoading } = useTableDataLoader();

    useEffect(() => {
        latestSignatureRef.current = createSignature(data);
    }, [createSignature, data]);

    const fetchData = useCallback(async (showLoadingState: boolean) => {
        const loadedItems = await runWithTableLoading({
            loader,
            errorMessage,
            showLoading: showLoadingState,
        });

        if (!loadedItems) {
            return;
        }

        const mappedItems = loadedItems.map(mapItem);
        const nextSignature = createSignature(mappedItems);

        if (nextSignature !== latestSignatureRef.current) {
            latestSignatureRef.current = nextSignature;
            setData(mappedItems);
        }
    }, [createSignature, errorMessage, loader, mapItem, runWithTableLoading]);

    useEffect(() => {
        const initialLoadTimeoutId = window.setTimeout(() => {
            void fetchData(true);
        }, 0);

        const intervalId = window.setInterval(() => {
            void fetchData(false);
        }, pollIntervalMs);

        return () => {
            window.clearTimeout(initialLoadTimeoutId);
            window.clearInterval(intervalId);
        };
    }, [fetchData, pollIntervalMs]);

    return {
        data,
        setData,
        isLoading,
        error,
        setError,
    };
}
