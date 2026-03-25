"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, Star, Shield, Zap } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ─── Right-side Mockup for Banner 1 (Client) ────────────────────────────
function ClientMockup() {
    const rootRef = useRef<HTMLDivElement>(null);
    
    useGSAP(() => {
        // Continuous float animation using GSAP
        gsap.to(".client-main-card", {
            y: -15, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut"
        });
        gsap.to(".client-badge-top", {
            y: -8, duration: 3.2, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.5
        });
        gsap.to(".client-badge-bottom", {
            y: -10, duration: 3.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1
        });
    }, { scope: rootRef });

    return (
        <div ref={rootRef} className="relative w-full h-full flex items-center justify-center pointer-events-none">
            {/* Main floating card */}
            <div
                className="client-main-card relative z-10 rounded-[2rem] p-6 w-[300px] border border-white/10 bg-black/40 backdrop-blur-2xl"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
            >
                {/* Card header */}
                <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-full border border-white/20 bg-gradient-to-br from-[#1DBF73] to-[#0d9e5c] flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-[0_0_15px_#1DBF73]">
                        AW
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white tracking-widest">0xAlexW</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <Star className="w-3.5 h-3.5 fill-[#FFBE00] text-[#FFBE00]" />
                            <span className="text-xs font-semibold text-white">5.0</span>
                            <span className="text-xs text-white/50">(312)</span>
                        </div>
                    </div>
                    <div className="ml-auto bg-[#1DBF73]/20 text-[#1DBF73] text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border border-[#1DBF73]/30">
                        Top Rated
                    </div>
                </div>
                <p className="text-sm text-white/90 font-medium mb-5 leading-relaxed">
                    I will build a secure Solidity smart contract with audit
                </p>
                <div className="flex gap-2 mb-5">
                    {["Solidity", "Audit", "Web3"].map(t => (
                        <span key={t} className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/60 border border-white/10">{t}</span>
                    ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#1DBF73] shadow-[0_0_8px_#1DBF73]" />
                        <span className="text-xs text-[#1DBF73] font-semibold uppercase tracking-wider">Escrow Active</span>
                    </div>
                    <div className="text-lg font-extrabold text-white">$299 <span className="text-[10px] text-white/40 font-normal">USDC</span></div>
                </div>
            </div>

            {/* Floating badge top-right */}
            <div className="client-badge-top absolute top-0 -right-6 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-3 z-20">
                <CheckCircle className="w-5 h-5 text-[#1DBF73]" />
                <span className="text-xs font-bold text-white tracking-wide">12,000+ experts</span>
            </div>

            {/* Floating badge bottom-left */}
            <div className="client-badge-bottom absolute -bottom-4 -left-4 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-3 z-20">
                <Shield className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-bold text-white tracking-wide">Funds secured</span>
            </div>
        </div>
    );
}

// ─── Right-side Mockup for Banner 2 (Freelancer) ────────────────────────────
function FreelancerMockup() {
    const rootRef = useRef<HTMLDivElement>(null);
    
    useGSAP(() => {
        gsap.to(".free-main-card", {
            y: -15, duration: 4.5, repeat: -1, yoyo: true, ease: "sine.inOut"
        });
        gsap.to(".free-avatar-1", {
            y: -10, duration: 3.5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.6
        });
        gsap.to(".free-avatar-2", {
            y: -8, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.2
        });
        gsap.to(".free-badge", {
            y: -12, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.3
        });
    }, { scope: rootRef });

    return (
        <div ref={rootRef} className="relative w-full h-full flex items-center justify-center pointer-events-none">
            {/* Main payment card */}
            <div
                className="free-main-card relative z-10 rounded-[2rem] p-6 w-[300px] bg-black/40 border border-white/10 backdrop-blur-2xl"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
            >
                {/* Payment received header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full border border-[#1DBF73]/30 bg-[#1DBF73]/20 flex items-center justify-center shadow-[0_0_15px_#1DBF73]">
                        <CheckCircle className="w-6 h-6 text-[#1DBF73]" />
                    </div>
                    <div>
                        <div className="text-white font-bold text-base tracking-wide">Payment Released!</div>
                        <div className="text-white/50 text-xs">Smart contract executed</div>
                    </div>
                </div>

                {/* Amount */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5 text-center">
                    <div className="text-white/50 text-xs uppercase tracking-widest mb-2">You received</div>
                    <div className="text-[#1DBF73] font-extrabold text-4xl mb-1 drop-shadow-[0_0_12px_#1DBF73]">$1,450</div>
                    <div className="text-white/40 text-[10px] uppercase font-bold tracking-widest">USDC · Polygon</div>
                </div>

                {/* Tx details */}
                <div className="space-y-3">
                    {[
                        { label: "From", val: "0xClient...4f2a" },
                        { label: "Tx Hash", val: "0x7d3e...9b1c" },
                        { label: "Fee", val: "2.5% · $36.25" },
                    ].map(r => (
                        <div key={r.label} className="flex items-center justify-between">
                            <span className="text-white/40 text-xs uppercase font-bold tracking-wider">{r.label}</span>
                            <span className="text-white/80 text-xs font-mono">{r.val}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating avatars and badges */}
            <div className="free-avatar-1 absolute -top-4 -left-4 z-20">
                <div className="w-14 h-14 rounded-full border-[3px] border-[#1E1E1E] shadow-2xl overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-base">MS</div>
                </div>
            </div>

            <div className="free-avatar-2 absolute -bottom-4 -right-4 z-20">
                <div className="w-12 h-12 rounded-full border-[3px] border-[#1E1E1E] shadow-2xl overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">PK</div>
                </div>
            </div>

            <div className="free-badge absolute top-1 -right-6 bg-[#1DBF73]/20 border border-[#1DBF73]/40 backdrop-blur-md rounded-xl px-3 py-2 shadow-xl flex items-center gap-2 z-20">
                <Zap className="w-4 h-4 text-[#1DBF73]" />
                <span className="text-xs uppercase font-bold tracking-widest text-[#1DBF73]">Instant</span>
            </div>
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PromoCardsSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        gsap.from(".promo-banner", {
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 75%",
            },
            y: 60,
            opacity: 0,
            duration: 1.2,
            stagger: 0.2,
            ease: "power3.out"
        });
    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} className="py-20 md:py-32 relative z-10 backdrop-blur-[2px]">
            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 space-y-8">

                {/* Banner 1 — For Clients (Deep Cinematic Dark) */}
                <div
                    className="promo-banner relative overflow-hidden rounded-[2.5rem]"
                    style={{
                        background: "linear-gradient(135deg, rgba(20,20,25,0.8) 0%, rgba(10,10,12,0.9) 100%)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
                        minHeight: 460,
                    }}
                >
                    <div className="absolute inset-0 opacity-[0.4]"
                        style={{ backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`, backgroundSize: "32px 32px" }} />

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-0 h-full">
                        {/* Left: text */}
                        <div className="flex flex-col justify-center p-10 md:p-16 lg:p-20">
                            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/50 mb-6">For Clients</p>
                            <h3
                                className="font-extrabold text-white mb-6 leading-[1.1] tracking-tighter"
                                style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)" }}
                            >
                                Find a Web3 expert,<br/>
                                <span className="text-transparent border-none bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">in minutes.</span>
                            </h3>
                            <p className="text-[#A1A1AA] text-lg font-light leading-relaxed mb-10 max-w-md">
                                Get matched with top-rated blockchain developers, designers, and auditors. Escrow-protected, every time.
                            </p>
                            <div>
                                <Link
                                    href="/jobs"
                                    className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-white text-black text-[15px] font-bold hover:scale-105 transition-transform duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                >
                                    Find an expert <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>

                        {/* Right: mockup */}
                        <div className="hidden md:block relative h-full min-h-[460px]">
                            <ClientMockup />
                        </div>
                    </div>
                </div>

                {/* Banner 2 — For Freelancers (Deep Cinematic Green) */}
                <div
                    className="promo-banner relative overflow-hidden rounded-[2.5rem]"
                    style={{
                        background: "linear-gradient(135deg, rgba(10,25,18,0.85) 0%, rgba(5,15,10,0.95) 100%)",
                        border: "1px solid rgba(29,191,115,0.15)",
                        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
                        minHeight: 460,
                    }}
                >
                    {/* Noise texture */}
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "160px 160px" }} />
                    
                    {/* Glow orb */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
                        style={{ background: "radial-gradient(circle, rgba(29,191,115,0.12) 0%, transparent 60%)", transform: "translate(20%, -30%)" }} />

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-0 h-full">
                        {/* Left: text */}
                        <div className="flex flex-col justify-center p-10 md:p-16 lg:p-20">
                            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#1DBF73] mb-6 drop-shadow-lg">For Freelancers</p>
                            <h3
                                className="font-extrabold text-white mb-6 leading-[1.1] tracking-tighter"
                                style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)" }}
                            >
                                Get paid on-chain,<br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1DBF73] to-[#86efac]">every time.</span>
                            </h3>
                            <p className="text-white/60 text-lg font-light leading-relaxed mb-10 max-w-md">
                                Smart contract escrow locks your payment before you start. No invoices, no chasing, no banks.
                            </p>
                            <div>
                                <Link
                                    href="/register"
                                    className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-[#1DBF73] text-white text-[15px] font-bold hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(29,191,115,0.4)]"
                                >
                                    Start earning <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>

                        {/* Right: mockup */}
                        <div className="hidden md:block relative h-full min-h-[460px]">
                            <FreelancerMockup />
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
