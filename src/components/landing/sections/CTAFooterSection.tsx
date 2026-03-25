"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const TESTIMONIALS = [
    {
        quote: "Got paid instantly after delivery. No dispute, no delay — the smart contract just worked.",
        name: "0xRamirez",
        role: "Solidity Developer",
        seed: "Ramirez",
        accentColor: "#1DBF73",
        cardBg: "linear-gradient(145deg, rgba(29,191,115,0.08) 0%, rgba(0,0,0,0.5) 100%)",
        border: "rgba(29,191,115,0.22)",
        shadow: "rgba(29,191,115,0.15)",
    },
    {
        quote: "As a client, I felt safe knowing my funds were locked until I approved. No more chargeback anxiety.",
        name: "0xPriya",
        role: "DeFi Startup Founder",
        seed: "Priya",
        accentColor: "#6366f1",
        cardBg: "linear-gradient(145deg, rgba(99,102,241,0.08) 0%, rgba(0,0,0,0.5) 100%)",
        border: "rgba(99,102,241,0.22)",
        shadow: "rgba(99,102,241,0.15)",
    },
    {
        quote: "The AI dispute resolution saved me weeks of back-and-forth. Fair, transparent, and fast.",
        name: "0xTomasz",
        role: "NFT Artist",
        seed: "Tomasz",
        accentColor: "#f59e0b",
        cardBg: "linear-gradient(145deg, rgba(245,158,11,0.08) 0%, rgba(0,0,0,0.5) 100%)",
        border: "rgba(245,158,11,0.22)",
        shadow: "rgba(245,158,11,0.15)",
    },
];

export default function CTAFooterSection() {
    const testimonialRef = useRef<HTMLElement>(null);
    const ctaRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        gsap.from(".testim-header", {
            scrollTrigger: { trigger: testimonialRef.current, start: "top 80%" },
            y: 40, opacity: 0, duration: 1, ease: "power3.out"
        });

        gsap.from(".testim-card", {
            scrollTrigger: { trigger: testimonialRef.current, start: "top 75%" },
            y: 50, opacity: 0, duration: 0.8, stagger: 0.15, ease: "back.out(1.2)"
        });

        gsap.from(".cta-content", {
            scrollTrigger: { trigger: ctaRef.current, start: "top 70%" },
            y: 60, opacity: 0, duration: 1.2, ease: "power3.out"
        });
        
        gsap.from(".cta-button", {
            scrollTrigger: { trigger: ctaRef.current, start: "top 65%" },
            scale: 0.9, opacity: 0, duration: 0.6, stagger: 0.1, ease: "back.out(1.5)", delay: 0.3
        });
    }, { scope: testimonialRef }); // Using testimonialRef to wrap the whole file

    return (
        <div ref={testimonialRef}>
            {/* ── Testimonials ─────────────────────────────────────────────── */}
            <section className="py-24 md:py-32 border-b border-white/5 relative z-10 backdrop-blur-[2px]">
                <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">

                    <div className="testim-header text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-[#1DBF73] flex-shrink-0 shadow-[0_0_8px_#1DBF73]" />
                            <span className="text-white/80 text-xs font-semibold uppercase tracking-[0.2em]">Testimonials</span>
                        </div>
                        <h2
                            className="font-extrabold text-white tracking-tight"
                            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1.1 }}
                        >
                            Trusted by Web3 builders
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        {TESTIMONIALS.map((t, i) => (
                            <div
                                key={t.name}
                                className="testim-card group relative rounded-[2rem] p-8 lg:p-10 flex flex-col overflow-hidden cursor-default transition-transform duration-500 hover:-translate-y-2 backdrop-blur-xl"
                                style={{
                                    background: t.cardBg,
                                    border: `1px solid ${t.border}`,
                                    boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.05)`,
                                }}
                            >
                                {/* Hover border glow */}
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                    style={{ boxShadow: `inset 0 0 20px ${t.shadow}` }}
                                />

                                <div className="relative z-10 flex flex-col flex-1">
                                    {/* Stars + badge */}
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, j) => (
                                                <svg key={j} className="w-4 h-4" viewBox="0 0 20 20" fill="#FFBE00" style={{ filter: "drop-shadow(0 0 2px rgba(255,190,0,0.5))" }}>
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <div
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md"
                                            style={{ background: `${t.accentColor}15`, border: `1px solid ${t.border}` }}
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: t.accentColor }} />
                                            <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: t.accentColor }}>On-chain</span>
                                        </div>
                                    </div>

                                    {/* Large opening quote */}
                                    <div
                                        className="font-black select-none mb-2"
                                        style={{
                                            fontSize: 72,
                                            color: t.accentColor,
                                            opacity: 0.15,
                                            lineHeight: 0.5,
                                            fontFamily: "Georgia, serif",
                                        }}
                                    >
                                        "
                                    </div>

                                    {/* Quote */}
                                    <p className="text-white/90 text-[16px] leading-relaxed flex-1 mb-8 font-light italic">
                                        {t.quote}
                                    </p>

                                    {/* Gradient divider */}
                                    <div
                                        className="h-px mb-6"
                                        style={{ background: `linear-gradient(90deg, ${t.accentColor}50, transparent)` }}
                                    />

                                    {/* Author */}
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-12 h-12 rounded-full flex-shrink-0 p-1"
                                            style={{ background: `linear-gradient(135deg, ${t.accentColor}, ${t.accentColor}20)` }}
                                        >
                                            <img
                                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${t.seed}&backgroundColor=000&fontColor=ffffff&fontFamily=Arial&fontSize=38`}
                                                alt={t.name}
                                                className="w-full h-full rounded-full border-2 border-black"
                                            />
                                        </div>
                                        <div>
                                            <div className="text-[15px] font-bold text-white tracking-wide">{t.name}</div>
                                            <div className="text-xs text-white/50">{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Banner — dark & dramatic ─────────────────────────────── */}
            <section ref={ctaRef} className="relative z-10 overflow-hidden" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(10,15,30,0.8) 100%)" }}>

                {/* Grid Overlay */}
                <div className="absolute inset-0 z-0 pointer-events-none"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                        transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
                        opacity: 0.5
                    }}
                />

                <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-32 md:py-40 text-center">
                    <div className="cta-content">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/60 text-[11px] font-bold uppercase tracking-[0.2em] mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(29,191,115,0.1)]">
                            <span className="w-2 h-2 rounded-full bg-[#1DBF73] animate-pulse flex-shrink-0 shadow-[0_0_8px_#1DBF73]" />
                            Live on Polygon · Escrow-protected
                        </div>

                        <h2
                            className="font-extrabold text-white mb-6 tracking-tight"
                            style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", lineHeight: 1.05 }}
                        >
                            Ready to work{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1DBF73] to-[#86efac] drop-shadow-[0_0_20px_rgba(29,191,115,0.4)]">fairly?</span>
                        </h2>
                        <p className="text-white/60 text-lg sm:text-xl mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                            Join 12,000+ Web3 freelancers and clients on the only escrow-protected blockchain marketplace.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/jobs/create"
                                className="cta-button inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full text-[15px] font-bold transition-all duration-300 hover:scale-105"
                                style={{
                                    background: "#1DBF73",
                                    color: "white",
                                    boxShadow: "0 8px 32px rgba(29,191,115,0.4)",
                                }}
                            >
                                Post a Job <ArrowRight className="w-5 h-5" />
                            </Link>

                            <Link
                                href="/jobs"
                                className="cta-button inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full text-[15px] font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 backdrop-blur-md"
                            >
                                Browse Services
                            </Link>
                        </div>

                        {/* Trust indicators */}
                        <div className="flex items-center justify-center gap-8 mt-14 flex-wrap opacity-60">
                            {[
                                "Flat 2.5% fee",
                                "Non-custodial",
                                "Open source contracts",
                            ].map((item) => (
                                <div key={item} className="flex items-center gap-2 text-white/70 text-[13px] uppercase tracking-wider font-bold">
                                    <span className="w-1 h-1 rounded-full bg-[#1DBF73] flex-shrink-0" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
