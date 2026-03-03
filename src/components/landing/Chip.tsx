"use client";

import { motion } from "framer-motion";

interface ChipProps {
    label: string;
    active?: boolean;
    onClick?: () => void;
}

export default function Chip({ label, active = false, onClick }: ChipProps) {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className={`relative rounded-pill px-5 py-2.5 text-sm font-medium transition-all duration-300 ${active
                    ? "bg-white text-backdrop shadow-glow-sm"
                    : "bg-white/[0.06] text-text-muted hover:bg-white/[0.1] hover:text-text-primary border border-transparent hover:border-surface-border"
                }`}
        >
            {label}
        </motion.button>
    );
}
