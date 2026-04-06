import "server-only";

import prisma from "@/lib/prisma";

export async function readUsersDb() {
    return prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function readUserRoleDb(userId: string) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            role: true,
        },
    });
}
