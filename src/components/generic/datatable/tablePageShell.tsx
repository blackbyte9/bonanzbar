import type { ReactNode } from "react";

type TablePageShellProps = {
    title: string;
    children: ReactNode;
};

export default function TablePageShell({ title, children }: TablePageShellProps) {
    return (
        <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen py-4 sm:static sm:left-auto sm:right-auto sm:mx-0 sm:w-full">
            <h1 className="mb-4 px-4 text-2xl font-bold sm:px-0">{title}</h1>
            <div className="w-full space-y-4 px-4 sm:px-0">
                {children}
            </div>
        </section>
    );
}
