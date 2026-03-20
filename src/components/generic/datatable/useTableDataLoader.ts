import { useCallback, useEffect, useRef, useState } from "react";

interface RunWithTableLoadingOptions<T> {
    loader: () => Promise<T>;
    errorMessage: string;
    showLoading?: boolean;
}

export function useTableDataLoader() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const runWithTableLoading = useCallback(
        async <T>({
            loader,
            errorMessage,
            showLoading = true,
        }: RunWithTableLoadingOptions<T>): Promise<T | undefined> => {
            try {
                if (showLoading) {
                    setIsLoading(true);
                }
                setError(null);

                const result = await loader();

                if (!isMountedRef.current) {
                    return undefined;
                }

                return result;
            } catch {
                if (isMountedRef.current) {
                    setError(errorMessage);
                }
                return undefined;
            } finally {
                if (showLoading && isMountedRef.current) {
                    setIsLoading(false);
                }
            }
        },
        [],
    );

    return {
        isLoading,
        error,
        setError,
        runWithTableLoading,
    };
}
