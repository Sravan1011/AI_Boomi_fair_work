"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface PageLoaderProps {
    onComplete: () => void;
}

export default function PageLoader({ onComplete }: PageLoaderProps) {
    const loaderRef = useRef<HTMLDivElement>(null);
    const barRef = useRef<HTMLDivElement>(null);
    const chars = "FairWork".split("");

    useEffect(() => {
        const loader = loaderRef.current;
        const bar = barRef.current;
        if (!loader || !bar) return;

        const tl = gsap.timeline({
            onComplete: () => {
                onComplete();
            }
        });

        // Char stagger reveal
        tl.to(".loader-char", {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.06,
            ease: "power4.out",
        });

        // Progress bar fill
        tl.to(bar, {
            width: "100%",
            duration: 1.0,
            ease: "power2.inOut",
        }, "-=0.3");

        // Hold briefly then exit
        tl.to(loader, {
            yPercent: -100,
            duration: 0.9,
            ease: "power4.inOut",
            delay: 0.2,
        });
    }, [onComplete]);

    return (
        <div ref={loaderRef} className="page-loader">
            <div className="noise-overlay" />
            <div className="loader-wordmark">
                {chars.map((char, i) => (
                    <span key={i} className="loader-char" style={{ transform: "translateY(120%)", opacity: 0 }}>
                        {char}
                    </span>
                ))}
            </div>
            <div className="loader-bar-wrap">
                <div ref={barRef} className="loader-bar" />
            </div>
        </div>
    );
}
