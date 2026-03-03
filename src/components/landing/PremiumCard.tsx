"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface PremiumCardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
}

export default function PremiumCard({
    children,
    className = "",
    hover = true,
}: PremiumCardProps) {
    return (
        <motion.div
            whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`relative overflow-hidden rounded-3xl border border-surface-border bg-surface-elevated/60 backdrop-blur-sm ${className}`}
            style={{
                boxShadow: "0 0 0 0 rgba(99, 102, 241, 0)",
                transition: "box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
                if (hover) {
                    e.currentTarget.style.boxShadow =
                        "0 0 40px rgba(99, 102, 241, 0.12), 0 8px 32px rgba(0, 0, 0, 0.4)";
                    e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.3)";
                }
            }}
            onMouseLeave={(e) => {
                if (hover) {
                    e.currentTarget.style.boxShadow =
                        "0 0 0 0 rgba(99, 102, 241, 0)";
                    e.currentTarget.style.borderColor = "";
                }
            }}
        >
            {children}
        </motion.div>
    );
}
