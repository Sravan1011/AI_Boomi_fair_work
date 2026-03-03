"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface CinematicImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    className?: string;
    priority?: boolean;
}

export default function CinematicImage({
    src,
    alt,
    width,
    height,
    fill = false,
    className = "",
    priority = false,
}: CinematicImageProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`cinematic-image-wrapper relative overflow-hidden rounded-3xl ${className}`}
        >
            {/* ① Base image — slight desaturation + contrast boost */}
            {fill ? (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    priority={priority}
                    className="object-cover"
                    style={{
                        filter: "saturate(0.85) contrast(1.1)",
                    }}
                />
            ) : (
                <Image
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    priority={priority}
                    className="object-cover w-full h-auto"
                    style={{
                        filter: "saturate(0.85) contrast(1.1)",
                        display: "block",
                    }}
                />
            )}

            {/* ② Indigo tone overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "linear-gradient(rgba(80, 60, 200, 0.25), rgba(10, 10, 20, 0.4))",
                    mixBlendMode: "overlay",
                }}
            />

            {/* ③ Grain texture overlay — SVG inline noise */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    opacity: 0.08,
                    mixBlendMode: "overlay",
                }}
            />

            {/* ④ Vignette */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle at center, transparent 60%, rgba(0,0,0,0.6) 100%)",
                }}
            />
        </motion.div>
    );
}
