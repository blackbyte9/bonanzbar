import { UserRole } from "@/prisma/browser";
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statements = {
    ...defaultStatements,
    content: ["create", "read", "update", "delete", "moderate"],
} as const;

export const ac = createAccessControl(statements);

export const roles = {
    [UserRole.ADMIN]: ac.newRole({
        ...adminAc.statements,
        content: ["create", "read", "update", "delete", "moderate"],
    }),
    [UserRole.ORGANIZER]: ac.newRole({
        content: ["create", "read", "update", "delete"],
    }),
    [UserRole.USER]: ac.newRole({
        content: ["read", "update"],
    }),
    [UserRole.GUEST]: ac.newRole({
        user: ["get"],
    }),
    [UserRole.INACTIVE]: ac.newRole({
        user: ["get"],
    }),
};
