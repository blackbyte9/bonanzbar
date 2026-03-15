import MainNav from "./mainNav";
import MobileNav from "./mobileNav";
import type { NavItem } from "./types";
import { UserRole } from "@/prisma/browser";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UserButton } from "@daveyplate/better-auth-ui";

const unknownNavItems: NavItem[] = [
    { label: "Home", href: "/" },
];

const guestNavItems: NavItem[] = [
    { label: "Home", href: "/" },
    { label: "Einkaufsliste", href: "/shopping" },
];

const userNavItems: NavItem[] = [
    ...guestNavItems,
];

const adminNavItems: NavItem[] = [
    ...userNavItems,
    { label: "Admin", href: "/admin" },
];

export function getNavItemsByRole(role: UserRole | null | undefined): NavItem[] {
    switch (role) {
        case UserRole.ADMIN:
        case UserRole.ORGANIZER:
            return adminNavItems;
        case UserRole.USER:
            return userNavItems;
        case UserRole.GUEST:
            return guestNavItems;
        case UserRole.INACTIVE:
        default:
            return unknownNavItems;
    }
}

function normalizeUserRole(role: string | null | undefined): UserRole | null {
    if (!role) {
        return null;
    }

    return Object.values(UserRole).includes(role as UserRole)
        ? (role as UserRole)
        : null;
}

export async function NavBar() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    const navItems = getNavItemsByRole(normalizeUserRole(session?.user?.role));

    return (
        <header className="navbar w-full bg-red-700">
            <div className="relative flex h-16.5 items-center px-4">
                <MainNav navItems={navItems} />
                <MobileNav navItems={navItems} />
                <div className="ml-auto">
                    <UserButton size="icon" />
                </div>
            </div>
        </header>
    );
};
