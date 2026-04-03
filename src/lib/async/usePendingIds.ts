"use client";

import { useCallback, useRef, useState } from "react";

type PendingId = string | number;

type UsePendingIdsResult<TId extends PendingId> = {
    isPending: (id: TId) => boolean;
    runWithPending: (id: TId, action: () => Promise<void>) => Promise<boolean>;
};

export function usePendingIds<TId extends PendingId>(): UsePendingIdsResult<TId> {
    const [pendingById, setPendingById] = useState<Record<string, boolean>>({});
    const pendingByIdRef = useRef<Record<string, boolean>>({});

    const isPending = useCallback(
        (id: TId) => Boolean(pendingById[String(id)]),
        [pendingById],
    );

    const runWithPending = useCallback(async (id: TId, action: () => Promise<void>) => {
        const key = String(id);

        if (pendingByIdRef.current[key]) {
            return false;
        }

        pendingByIdRef.current[key] = true;
        setPendingById((prev) => ({
            ...prev,
            [key]: true,
        }));

        try {
            await action();
            return true;
        } finally {
            pendingByIdRef.current[key] = false;
            setPendingById((prev) => ({
                ...prev,
                [key]: false,
            }));
        }
    }, []);

    return {
        isPending,
        runWithPending,
    };
}
