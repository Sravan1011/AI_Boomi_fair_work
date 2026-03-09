"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import CinematicImage from "./CinematicImage";

interface HeroImage3DProps {
    src: string;
    alt: string;
}

export default function HeroImage3D({ src, alt }: HeroImage3DProps) {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Normalize coordinates from -0.5 to 0.5
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            initial={{ y: 0 }}
            animate={{ y: [-10, 10, -10] }}
            transition={{
                repeat: Infinity,
                duration: 6,
                ease: "easeInOut",
            }}
            className="relative w-full aspect-square perspective-[1500px] z-10"
        >
            {/* Background glow specific to the image depth */}
            <div className="absolute inset-8 rounded-full bg-accent-indigo/20 blur-[80px] -z-20" />
            <div className="absolute inset-16 rounded-full bg-accent-violet/20 blur-[60px] -z-20" />

            {/* Main Image Container */}
            <motion.div
                className="relative w-full h-full rounded-[2rem] border border-white/10 bg-surface-elevated/40 backdrop-blur-md shadow-2xl shadow-indigo-500/10 overflow-hidden p-2 group"
                style={{
                    transform: "translateZ(40px)",
                }}
            >
                <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden bg-backdrop">
                    <div
                        style={{
                            WebkitMaskImage: [
                                "linear-gradient(to right,  transparent 0%, black 15%, black 85%, transparent 100%)",
                                "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
                            ].join(", "),
                            WebkitMaskComposite: "source-in",
                            maskImage: [
                                "linear-gradient(to right,  transparent 0%, black 15%, black 85%, transparent 100%)",
                                "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
                            ].join(", "),
                            maskComposite: "intersect",
                        }}
                        className="w-full h-full"
                    >
                        <CinematicImage
                            src={src}
                            alt={alt}
                            width={800}
                            height={800}
                            className="w-full h-full object-cover !rounded-none scale-105 transition-transform duration-1000 group-hover:scale-100"
                            priority
                        />
                    </div>

                    {/* Dynamic glass overlay */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none mix-blend-overlay"
                        style={{
                            x: useTransform(mouseXSpring, [-0.5, 0.5], ["-50%", "50%"]),
                            y: useTransform(mouseYSpring, [-0.5, 0.5], ["-50%", "50%"]),
                        }}
                    />
                </div>
            </motion.div>

            {/* Floating Elements that pop out even more */}
            <motion.div
                className="absolute -bottom-6 -left-6 md:-left-12 rounded-2xl border border-surface-border bg-surface-elevated/80 backdrop-blur-xl p-4 shadow-glow-sm"
                style={{ transform: "translateZ(80px)" }}
            >
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-accent-indigo/20 flex items-center justify-center border border-accent-indigo/30">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-text-primary">Escrow Protected</p>
                        <p className="text-xs text-text-muted mt-0.5">USDC · Smart Contract</p>
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="absolute -top-6 -right-6 md:-right-8 rounded-2xl border border-surface-border bg-surface-elevated/80 backdrop-blur-xl px-5 py-3.5 shadow-glow-sm"
                style={{ transform: "translateZ(100px)" }}
            >
                <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <p className="text-sm text-text-primary font-medium">Live on Polygon</p>
                </div>
            </motion.div>
        </motion.div>
    );
}
