"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface FadeInOnScrollProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: "up" | "left" | "right" | "none";
}

export default function FadeInOnScroll({
    children,
    className = "",
    delay = 0,
    direction = "up",
}: FadeInOnScrollProps) {
    const directionOffset = {
        up: { y: 30 },
        left: { x: -30 },
        right: { x: 30 },
        none: {},
    };

    return (
        <motion.div
            initial={{ opacity: 0, ...directionOffset[direction] }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: "easeOut", delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
