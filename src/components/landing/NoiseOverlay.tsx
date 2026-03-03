"use client";

export default function NoiseOverlay() {
    return (
        <div
            className="pointer-events-none fixed inset-0 z-50"
            aria-hidden="true"
            style={{
                backgroundImage: `url("/assets/textures/noise.svg")`,
                backgroundSize: "256px 256px",
                backgroundRepeat: "repeat",
                opacity: 0.04,
                mixBlendMode: "overlay",
            }}
        />
    );
}
