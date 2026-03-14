import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, roles } from "./permissions";

export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    plugins: [
        adminClient({
            ac,
            roles: roles
        }),
    ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
