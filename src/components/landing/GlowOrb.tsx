"use client";

interface GlowOrbProps {
    color?: "indigo" | "violet" | "blue";
    size?: string;
    className?: string;
    animate?: boolean;
}

const colorMap = {
    indigo: "rgba(99, 102, 241, 0.18)",
    violet: "rgba(124, 58, 237, 0.14)",
    blue: "rgba(59, 130, 246, 0.12)",
};

export default function GlowOrb({
    color = "indigo",
    size = "600px",
    className = "",
    animate = true,
}: GlowOrbProps) {
    return (
        <div
            className={`pointer-events-none absolute rounded-full blur-3xl ${animate ? "animate-glow-pulse" : ""
                } ${className}`}
            style={{
                width: size,
                height: size,
                background: `radial-gradient(circle, ${colorMap[color]}, transparent 70%)`,
            }}
        />
    );
}
