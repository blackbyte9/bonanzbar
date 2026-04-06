import "server-only";

import prisma from "@/lib/prisma";
import { UserRole } from "@/prisma/enums";

export async function updateUserRoleDb(userId: string, role: UserRole) {
    return prisma.user.update({
        where: { id: userId },
        data: {
            role,
        },
        select: {
            id: true,
            role: true,
        },
    });
}
