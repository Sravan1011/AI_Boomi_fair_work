"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const dot = dotRef.current;
        const ring = ringRef.current;
        if (!dot || !ring) return;

        // Fast GSAP quickTo for high-performance cursor tracking
        const xDot = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3" });
        const yDot = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3" });
        const xRing = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" });
        const yRing = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });

        const onMove = (e: MouseEvent) => {
            xDot(e.clientX);
            yDot(e.clientY);
            xRing(e.clientX);
            yRing(e.clientY);
        };

        const onOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isInteractive = target.closest("a, button, [role='button'], input, textarea, .hover-magnetic");
            if (isInteractive) {
                dot.classList.add("hovering");
                ring.classList.add("hovering");
            }
        };

        const onOut = () => {
            dot.classList.remove("hovering");
            ring.classList.remove("hovering");
        };

        window.addEventListener("mousemove", onMove);
        document.addEventListener("mouseover", onOver);
        document.addEventListener("mouseout", onOut);

        // Appear animation
        gsap.fromTo([dot, ring], { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.5, delay: 0.3, ease: "back.out(2)" });

        return () => {
            window.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseover", onOver);
            document.removeEventListener("mouseout", onOut);
        };
    }, []);

    return (
        <>
            <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
            <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
        </>
    );
}
