import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins/admin";
import prisma from "@/lib/prisma";
import { nextCookies } from "better-auth/next-js";
import { ac, roles } from './permissions';
import { UserRole } from "@/prisma/browser";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  experimental: { joins: true },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  plugins: [
    admin({
      ac,
      roles: roles,
      defaultRole: UserRole.GUEST,
      adminRoles: [UserRole.ADMIN, UserRole.ORGANIZER],

    }),
    nextCookies(),
  ],
});
