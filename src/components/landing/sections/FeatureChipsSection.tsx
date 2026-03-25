"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import BorderGlow from "@/components/landing/BorderGlow";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

function IconEscrow() {
    return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="3" y="10" width="16" height="11" rx="2.5" stroke="white" strokeWidth="1.6" />
            <path d="M7 10V7a4 4 0 0 1 8 0v3" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="11" cy="15.5" r="1.5" fill="white" />
            <path d="M11 15.5v2" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    );
}

function IconAI() {
    return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 2v2M11 18v2M2 11h2M18 11h2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="11" cy="11" r="4" stroke="white" strokeWidth="1.5" />
            <circle cx="11" cy="11" r="1.5" fill="white" />
            <path d="M4.9 4.9l1.4 1.4M15.7 15.7l1.4 1.4M4.9 17.1l1.4-1.4M15.7 6.3l1.4-1.4" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
    );
}

function IconDecentralized() {
    return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="3" stroke="white" strokeWidth="1.5" />
            <circle cx="4" cy="4" r="2" stroke="white" strokeWidth="1.4" />
            <circle cx="18" cy="4" r="2" stroke="white" strokeWidth="1.4" />
            <circle cx="4" cy="18" r="2" stroke="white" strokeWidth="1.4" />
            <circle cx="18" cy="18" r="2" stroke="white" strokeWidth="1.4" />
            <path d="M8.5 8.5L6 6M13.5 8.5L16 6M8.5 13.5L6 16M13.5 13.5L16 16" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
    );
}

function IconVerified() {
    return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 2L13.5 5h4l-1.5 3.5L19 11l-3 1.5L17 16h-4L11 19l-2-3.5H5l1.5-3.5L3 11l3-2.5L4.5 5h4L11 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M8 11l2 2 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function IconNonCustodial() {
    return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 2l8 4v6c0 4.5-3.5 8-8 9-4.5-1-8-4.5-8-9V6l8-4z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M8 11l2 2 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function IconFees() {
    return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="2" y="4" width="18" height="14" rx="2.5" stroke="white" strokeWidth="1.5" />
            <path d="M6 9h4M6 13h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M14 9.5v5M12.5 11h3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="15" cy="11.5" r="3" stroke="white" strokeWidth="1.3" />
        </svg>
    );
}

const FEATURES = [
    {
        Icon: IconEscrow,
        title: "Escrow-Protected",
        desc: "Funds locked in smart contract. Released only when both parties approve delivery.",
        color: "#1DBF73",
        iconBg: "#1DBF73",
        border: "rgba(29,191,115,0.15)",
        shadowColor: "rgba(29,191,115,0.25)",
        num: "01",
        tag: "Payments",
        cardBgGlass: "rgba(10, 10, 22, 0.85)",
    },
    {
        Icon: IconAI,
        title: "AI Dispute Resolution",
        desc: "Groq-powered AI reviews disputes, transcribes meetings, and generates legal reports.",
        color: "#6366f1",
        iconBg: "#6366f1",
        border: "rgba(99,102,241,0.15)",
        shadowColor: "rgba(99,102,241,0.25)",
        num: "02",
        tag: "AI-Powered",
        cardBgGlass: "rgba(10, 10, 22, 0.85)",
    },
    {
        Icon: IconDecentralized,
        title: "Decentralized",
        desc: "No middlemen. Contracts on Polygon. Payments in USDC. All verifiable on-chain.",
        color: "#f59e0b",
        iconBg: "#f59e0b",
        border: "rgba(245,158,11,0.15)",
        shadowColor: "rgba(245,158,11,0.25)",
        num: "03",
        tag: "On-Chain",
        cardBgGlass: "rgba(10, 10, 22, 0.85)",
    },
    {
        Icon: IconVerified,
        title: "Verified Freelancers",
        desc: "On-chain reputation scores, peer reviews, and verified skill badges you can trust.",
        color: "#ef4444",
        iconBg: "#ef4444",
        border: "rgba(239,68,68,0.15)",
        shadowColor: "rgba(239,68,68,0.25)",
        num: "04",
        tag: "Trust",
        cardBgGlass: "rgba(10, 10, 22, 0.85)",
    },
    {
        Icon: IconNonCustodial,
        title: "Non-Custodial",
        desc: "You control your funds. Connect any Web3 wallet — no sign-up or KYC required.",
        color: "#0ea5e9",
        iconBg: "#0ea5e9",
        border: "rgba(14,165,233,0.15)",
        shadowColor: "rgba(14,165,233,0.25)",
        num: "05",
        tag: "Self-Custody",
        cardBgGlass: "rgba(10, 10, 22, 0.85)",
    },
    {
        Icon: IconFees,
        title: "Transparent Fees",
        desc: "Flat 2.5% platform fee. Zero hidden charges. Full audit trail stored on-chain.",
        color: "#8b5cf6",
        iconBg: "#8b5cf6",
        border: "rgba(139,92,246,0.15)",
        shadowColor: "rgba(139,92,246,0.25)",
        num: "06",
        tag: "2.5% Fee",
        cardBgGlass: "rgba(10, 10, 22, 0.85)",
    },
];

export default function FeatureChipsSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        gsap.from(".fc-header", {
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 80%",
            },
            y: 40,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });

        gsap.from(".fc-card", {
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 75%",
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "back.out(1.2)"
        });
    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} id="why-fairwork" className="py-24 md:py-32 border-b border-white/5 relative z-10">
            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="fc-header text-center max-w-2xl mx-auto mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-[#1DBF73] flex-shrink-0 shadow-[0_0_8px_#1DBF73]" />
                        <span className="text-white/80 text-xs font-semibold uppercase tracking-[0.2em]">Why FairWork</span>
                    </div>
                    <h2
                        className="font-extrabold text-white mb-5 tracking-tight"
                        style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1.1 }}
                    >
                        Everything you need for secure Web3 hiring
                    </h2>
                    <p className="text-[#A1A1AA] text-lg leading-relaxed font-light">
                        Built on blockchain, powered by AI — the freelance platform that actually protects you.
                    </p>
                </div>

                {/* Feature cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURES.map((f) => (
                        <BorderGlow
                            key={f.title}
                            className="fc-card group cursor-default transition-transform duration-500 hover:-translate-y-2 h-full"
                            borderRadius={32}
                            glowIntensity={1.0}
                            coneSpread={30}
                            backgroundColor={f.cardBgGlass}
                        >
                            {/* inner clip wrapper */}
                            <div className="relative overflow-hidden rounded-[32px] p-8 h-full flex flex-col">
                                {/* Watermark number */}
                                <span
                                    className="absolute bottom-2 right-3 font-black leading-none select-none pointer-events-none"
                                    style={{ fontSize: 100, color: `${f.iconBg}12` }}
                                >
                                    {f.num}
                                </span>

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-8">
                                        {/* Icon */}
                                        <div
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
                                            style={{
                                                background: f.iconBg,
                                                boxShadow: `0 8px 24px ${f.shadowColor}`,
                                            }}
                                        >
                                            <f.Icon />
                                        </div>
                                        {/* Tag pill */}
                                        <span
                                            className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
                                            style={{
                                                color: f.color,
                                                background: `${f.iconBg}18`,
                                                border: `1px solid ${f.border}`,
                                            }}
                                        >
                                            {f.tag}
                                        </span>
                                    </div>

                                    <h3 className="text-white font-bold text-lg mb-3 leading-snug tracking-wide">{f.title}</h3>
                                    <p className="text-white/55 text-[15px] leading-relaxed font-light">{f.desc}</p>
                                </div>
                            </div>
                        </BorderGlow>
                    ))}
                </div>

            </div>
        </section>
    );
}
