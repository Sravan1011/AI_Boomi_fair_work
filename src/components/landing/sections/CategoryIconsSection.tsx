"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const CATEGORIES = [
    {
        label: "Smart\nContracts",
        href: "/jobs?category=Smart+Contracts",
        bg: "linear-gradient(160deg, #0a1f16 0%, #030a07 100%)",
        tint: "rgba(29,191,115,0.18)",
        glow: "#1DBF73",
        image: "/images/landing/hero-molecular.png",
    },
    {
        label: "DApp\nDevelopment",
        href: "/jobs?category=DApp+Development",
        bg: "linear-gradient(160deg, #0e122b 0%, #050614 100%)",
        tint: "rgba(99,102,241,0.18)",
        glow: "#6366f1",
        image: "/images/category-webdev.png",
    },
    {
        label: "Web3\nDesign",
        href: "/jobs?category=Web3+Design",
        bg: "linear-gradient(160deg, #2a0b1f 0%, #170410 100%)",
        tint: "rgba(236,72,153,0.18)",
        glow: "#ec4899",
        image: "/images/category-design.png",
    },
    {
        label: "DeFi\nProtocols",
        href: "/jobs?category=DeFi+Protocols",
        bg: "linear-gradient(160deg, #241a04 0%, #120c00 100%)",
        tint: "rgba(245,158,11,0.18)",
        glow: "#f59e0b",
        image: "/images/landing/soundwave.png",
    },
    {
        label: "NFT\nProjects",
        href: "/jobs?category=NFT+Projects",
        bg: "linear-gradient(160deg, #180a2b 0%, #090314 100%)",
        tint: "rgba(168,85,247,0.18)",
        glow: "#a855f7",
        image: "/images/category-design.png",
    },
    {
        label: "AI\nAgents",
        href: "/jobs?category=AI+Agents",
        bg: "linear-gradient(160deg, #07122b 0%, #020712 100%)",
        tint: "rgba(59,130,246,0.18)",
        glow: "#3b82f6",
        image: "/images/category-ai.png",
    },
    {
        label: "Smart\nAuditing",
        href: "/jobs?category=Auditing",
        bg: "linear-gradient(160deg, #051a14 0%, #020a07 100%)",
        tint: "rgba(16,185,129,0.18)",
        glow: "#10b981",
        image: "/images/landing/workspace.png",
    },
    {
        label: "Token\nLaunch",
        href: "/jobs?category=Token+Launch",
        bg: "linear-gradient(160deg, #2b1104 0%, #140700 100%)",
        tint: "rgba(249,115,22,0.18)",
        glow: "#f97316",
        image: "/images/category-marketing.png",
    },
    {
        label: "DAO\nGovernance",
        href: "/jobs?category=DAO",
        bg: "linear-gradient(160deg, #10062b 0%, #060214 100%)",
        tint: "rgba(139,92,246,0.18)",
        glow: "#8b5cf6",
        image: "/images/landing/studio.png",
    },
];

export default function CategoryIconsSection() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLElement>(null);

    const scroll = (dir: "left" | "right") => {
        scrollRef.current?.scrollBy({ left: dir === "right" ? 620 : -620, behavior: "smooth" });
    };

    useGSAP(() => {
        gsap.from(".cat-header", {
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 80%",
            },
            y: 30,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });

        gsap.from(".cat-card", {
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 75%",
            },
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "back.out(1.2)"
        });
    }, { scope: containerRef });

    return (
        <section ref={containerRef} className="py-20 md:py-32 border-b border-white/5 relative z-10 backdrop-blur-[2px]">
            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">

                <div className="cat-header flex items-end justify-between mb-12">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1DBF73] mb-4">Domains</p>
                        <h2
                            className="font-bold text-white tracking-tighter"
                            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1.1 }}
                        >
                            Explore Web3<br/>Service Categories
                        </h2>
                    </div>
                    <div className="hidden sm:flex items-center gap-3">
                        <button
                            onClick={() => scroll("left")}
                            className="w-14 h-14 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all duration-300 backdrop-blur-xl"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            className="w-14 h-14 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all duration-300 backdrop-blur-xl"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Scroll carousel */}
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto pb-8 pt-4 px-2 -mx-2"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {CATEGORIES.map((cat) => (
                        <div
                            key={cat.label}
                            className="cat-card flex-shrink-0"
                        >
                            <Link
                                href={cat.href}
                                className="block group"
                                style={{ width: 280, height: 360 }}
                            >
                                <div
                                    className="relative overflow-hidden rounded-[2.5rem] w-full h-full cursor-pointer transition-all duration-500 group-hover:-translate-y-3 border border-white/5"
                                    style={{
                                        background: cat.bg,
                                        boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                                    }}
                                >
                                    {/* Abstract image */}
                                    <img
                                        src={cat.image}
                                        alt=""
                                        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                        style={{ opacity: 0.45, mixBlendMode: "luminosity" }}
                                    />

                                    {/* Color tint overlay */}
                                    <div
                                        className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-100 opacity-70"
                                        style={{ background: `linear-gradient(160deg, ${cat.tint} 0%, transparent 60%)` }}
                                    />

                                    {/* Radial glow from center-top */}
                                    <div
                                        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full pointer-events-none transition-all duration-500 group-hover:scale-110 opacity-30 group-hover:opacity-60"
                                        style={{ background: `radial-gradient(circle, ${cat.glow}55 0%, transparent 70%)` }}
                                    />

                                    {/* Bottom title gradient panel */}
                                    <div
                                        className="absolute bottom-0 left-0 right-0 p-7"
                                        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)" }}
                                    >
                                        <p className="text-white font-extrabold text-[1.35rem] leading-[1.2] whitespace-pre-line tracking-tight">
                                            {cat.label}
                                        </p>
                                    </div>

                                    {/* Hover border */}
                                    <div className="absolute inset-0 rounded-[2.5rem] border-2 border-white/0 group-hover:border-white/10 transition-all duration-300 pointer-events-none" />
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
