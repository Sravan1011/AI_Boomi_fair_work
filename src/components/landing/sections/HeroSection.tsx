"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

export default function HeroSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".hero-text",
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 1.2, stagger: 0.2, ease: "power4.out", delay: 0.2 }
            );
            
            // Subtle floating animation for the entire text block to complement the 3D background
            gsap.to(".hero-content", {
                y: -15,
                duration: 4,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="relative flex flex-col items-center justify-center min-h-[100dvh] overflow-hidden px-6">

            {/* ── Platform visuals — float behind hero text ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
                {/* Escrow visualization — bottom left */}
                <img
                    src="/images/platform/escrow.svg"
                    alt=""
                    className="absolute"
                    style={{
                        width: "560px",
                        bottom: "-60px",
                        left: "-80px",
                        opacity: 0.18,
                        filter: "blur(0.5px)",
                        transform: "rotate(-6deg)",
                    }}
                />
                {/* Network visualization — top right */}
                <img
                    src="/images/platform/network.svg"
                    alt=""
                    className="absolute"
                    style={{
                        width: "520px",
                        top: "-40px",
                        right: "-60px",
                        opacity: 0.16,
                        filter: "blur(0.5px)",
                        transform: "rotate(8deg)",
                    }}
                />
                {/* Match visualization — center, faint */}
                <img
                    src="/images/platform/match.svg"
                    alt=""
                    className="absolute"
                    style={{
                        width: "600px",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        opacity: 0.08,
                    }}
                />
            </div>

            <div className="hero-content relative z-10 text-center max-w-5xl mx-auto mt-20 pointer-events-auto">
                <h1 className="hero-text text-white font-extrabold tracking-tighter mb-4 drop-shadow-2xl"
                    style={{ fontSize: "clamp(4rem, 12vw, 10rem)", lineHeight: 0.9 }}>
                    FairWork
                </h1>
                <p className="hero-text text-[#A1A1AA] text-lg sm:text-2xl md:text-3xl font-light mb-12 max-w-3xl mx-auto tracking-wide">
                    The Decentralized Protocol for Future Labor.
                </p>
                
                <div className="hero-text flex flex-wrap items-center justify-center gap-6">
                    <Link
                        href="/jobs"
                        className="px-10 py-5 rounded-full bg-white text-black font-semibold text-lg hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                    >
                        Launch App
                    </Link>
                    <Link
                        href="/how-it-works"
                        className="px-10 py-5 rounded-full border border-white/20 text-white font-semibold text-lg hover:bg-white/10 transition-colors duration-300 backdrop-blur-lg"
                    >
                        Explore Network
                    </Link>
                </div>
            </div>
            
            {/* Cinematic Scroll Indicator */}
            <div className="hero-text absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-60">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white">Scroll to Explore</span>
                <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent" />
            </div>
        </section>
    );
}
