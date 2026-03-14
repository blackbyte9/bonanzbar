import { PrismaClient } from "@/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { env } from "prisma/config";

const globalForPrisma = global as unknown as {
    prisma: PrismaClient;
};
const adapter = new PrismaNeon({
    connectionString: env("DATABASE_URL"),
});
const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
    });
if (env("NODE_ENV") !== "production") globalForPrisma.prisma = prisma;
export default prisma;
