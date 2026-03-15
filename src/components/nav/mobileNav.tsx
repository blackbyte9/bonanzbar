"use client";
import { useState } from 'react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetHeader } from '@/shadcn/components/ui/sheet';
import { Button } from '@/shadcn/components/ui/button';
import { Menu as MenuIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { NavItem } from './types';

type MobileNavProps = {
    navItems: NavItem[];
};

export default function MobileNav({ navItems }: MobileNavProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className="pointer-events-none absolute top-1/2 left-1/2 mt-1.25 -translate-x-1/2 -translate-y-1/2 md:hidden">
                <Image
                    src="/logo.png"
                    alt="Bonanzbar Logo"
                    width={480}
                    height={88}
                    className="h-10 w-auto"
                />
            </div>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger className="md:hidden">
                    <MenuIcon />
                </SheetTrigger>

                <SheetContent side="left">
                    <SheetHeader>
                        <SheetTitle>Main Menu</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col items-start">
                        {navItems.map((item, index) => (
                            <Button
                                key={index}
                                variant="link"
                            >
                                <Link
                                    href={item.href}
                                    onClick={() => {
                                        setOpen(false);
                                    }}
                                >
                                    {item.label}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </SheetContent>

            </Sheet>
        </>
    );
};
