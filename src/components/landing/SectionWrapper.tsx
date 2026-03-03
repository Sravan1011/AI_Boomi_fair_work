"use client";

import { ReactNode } from "react";

interface SectionWrapperProps {
    children: ReactNode;
    id?: string;
    className?: string;
    noPaddingTop?: boolean;
    noPaddingBottom?: boolean;
}

export default function SectionWrapper({
    children,
    id,
    className = "",
    noPaddingTop = false,
    noPaddingBottom = false,
}: SectionWrapperProps) {
    return (
        <section
            id={id}
            className={`relative ${noPaddingTop ? "" : "pt-20 md:pt-section"} ${noPaddingBottom ? "" : "pb-20 md:pb-section"
                } ${className}`}
        >
            {children}
        </section>
    );
}
