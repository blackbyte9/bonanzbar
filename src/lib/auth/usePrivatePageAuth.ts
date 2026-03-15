"use client";

import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function isAuthorizedRole(
    role: string | null | undefined,
    allowedRoles: readonly string[],
) {
    return role ? allowedRoles.includes(role) : false;
}

export default function usePrivatePageAuth(
    allowedRoles: readonly string[],
    redirectPath = "/",
) {
    const { data: session, isPending: isSessionLoading } =
        authClient.useSession();
    const router = useRouter();
    const isAuthorized = isAuthorizedRole(session?.user?.role, allowedRoles);

    useEffect(() => {
        if (!isSessionLoading && !isAuthorized) {
            router.push(redirectPath);
        }
    }, [isSessionLoading, isAuthorized, redirectPath, router]);

    return {
        isSessionLoading,
        isAuthorized,
        username: session?.user?.name || null,
    };
}
