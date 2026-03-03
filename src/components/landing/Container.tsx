"use client";

import { ReactNode } from "react";

interface ContainerProps {
    children: ReactNode;
    className?: string;
}

export default function Container({ children, className = "" }: ContainerProps) {
    return (
        <div className={`mx-auto w-full max-w-container px-6 md:px-12 ${className}`}>
            {children}
        </div>
    );
}
