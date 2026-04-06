import "server-only";

import prisma from "@/lib/prisma";

export async function deleteUserDb(userId: string): Promise<void> {
    await prisma.user.delete({
        where: { id: userId },
    });
}
