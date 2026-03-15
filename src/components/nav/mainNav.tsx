import { Button } from "@/shadcn/components/ui/button";
import Link from "next/link";
import type { NavItem } from "./types";
import Image from 'next/image';

type MainNavProps = {
    navItems: NavItem[];
};

export default function MainNav({ navItems }: MainNavProps) {
    return (
        <div className="mr-4 hidden gap-2 md:flex" style={{ marginTop: "5px" }}>
            <Image src={"/logo.png"} alt="Bonanzbar Logo" width={480} height={88} />
            <div className="mr-4 hidden gap-2 md:flex items-center">
                {navItems.map((item, index) => (
                    <Button key={index} variant="link">
                        <Link href={item.href} className="text-gray-300 font-bold text-lg">{item.label}</Link>
                    </Button>
                ))}
            </div>
        </div>
    );
};
