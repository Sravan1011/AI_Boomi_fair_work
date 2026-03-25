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
                    ? "bg-[#1DBF73] text-white shadow-card"
                    : "bg-white text-[#74767E] hover:bg-[#F7F7F7] hover:text-[#404145] border border-[#E4E5E7]"
                }`}
        >
            {label}
        </motion.button>
    );
}
