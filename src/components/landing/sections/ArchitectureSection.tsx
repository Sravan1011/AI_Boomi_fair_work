"use client";

import { useRef } from "react";
import { Search, Lock, MessageSquare, CheckCircle2 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import BorderGlow from "@/components/landing/BorderGlow";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const STEPS = [
    {
        number: "01",
        Icon: Search,
        title: "Post or Browse",
        desc: "Post a job with budget and timeline, or browse thousands of verified Web3 specialists.",
        color: "#1DBF73",
        iconBg: "#1DBF73",
        shadow: "rgba(29,191,115,0.3)",
        border: "rgba(29,191,115,0.22)",
        highlights: ["Instant matches", "1,000+ profiles"],
        cardBgGlass: "rgba(10, 10, 22, 0.85)",
    },
    {
        number: "02",
        Icon: Lock,
        title: "Agree & Lock",
        desc: "Accept a proposal and lock payment into the FairWork smart contract — fully on-chain.",
        color: "#6366f1",
        iconBg: "#6366f1",
        shadow: "rgba(99,102,241,0.3)",
        border: "rgba(99,102,241,0.22)",
        highlights: ["USDC escrow", "Smart contract"],
        cardBgGlass: "rgba(10, 10, 22, 0.85)",
    },
    {
        number: "03",
        Icon: MessageSquare,
        title: "Work & Deliver",
        desc: "Collaborate in the built-in workspace. Chat, share files, and track milestones together.",
        color: "#f59e0b",
        iconBg: "#f59e0b",
        shadow: "rgba(245,158,11,0.3)",
        border: "rgba(245,158,11,0.22)",
        highlights: ["Live chat", "File sharing"],
        cardBgGlass: "rgba(10, 10, 22, 0.85)",
    },
    {
        number: "04",
        Icon: CheckCircle2,
        title: "Release & Review",
        desc: "Approve delivery to release escrowed funds instantly. Disputes resolved by AI arbitration.",
        color: "#ef4444",
        iconBg: "#ef4444",
        shadow: "rgba(239,68,68,0.3)",
        border: "rgba(239,68,68,0.22)",
        highlights: ["AI arbitration", "On-chain proof"],
        cardBgGlass: "rgba(10, 10, 22, 0.85)",
    },
];

export default function ArchitectureSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        gsap.from(".arch-header", {
            scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
            y: 40, opacity: 0, duration: 1, ease: "power3.out"
        });

        gsap.fromTo(".arch-line",
            { scaleX: 0 },
            {
                scrollTrigger: { trigger: sectionRef.current, start: "top 65%" },
                scaleX: 1, duration: 1.5, ease: "power3.inOut"
            }
        );

        gsap.from(".arch-step", {
            scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
            y: 50, opacity: 0, duration: 0.8, stagger: 0.15, ease: "back.out(1.2)"
        });
    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} id="how-it-works" className="py-24 md:py-32 relative z-10">
            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="arch-header text-center max-w-2xl mx-auto mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-[#1DBF73] flex-shrink-0 shadow-[0_0_8px_#1DBF73]" />
                        <span className="text-white/80 text-xs font-semibold uppercase tracking-[0.2em]">How It Works</span>
                    </div>
                    <h2
                        className="font-extrabold text-white mb-5 tracking-tight"
                        style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1.1 }}
                    >
                        Hire in 4 simple steps
                    </h2>
                    <p className="text-[#A1A1AA] text-lg leading-relaxed font-light">
                        From posting to payment — every step protected by smart contracts.
                    </p>
                </div>

                {/* Steps grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">

                    {/* Animated connecting line */}
                    <div
                        className="arch-line hidden lg:block absolute top-[60px] left-[13%] right-[13%] h-1 z-0 rounded-full"
                        style={{
                            background: "linear-gradient(90deg, #1DBF73 0%, #6366f1 33%, #f59e0b 66%, #ef4444 100%)",
                            opacity: 0.5,
                            transformOrigin: "left center",
                            boxShadow: "0 0 15px rgba(255,255,255,0.1)"
                        }}
                    />

                    {STEPS.map((step) => (
                        <BorderGlow
                            key={step.number}
                            className="arch-step group cursor-default transition-transform duration-500 hover:-translate-y-2 relative z-10"
                            borderRadius={32}
                            glowIntensity={1.0}
                            coneSpread={30}
                            backgroundColor={step.cardBgGlass}
                        >
                            {/* inner clip wrapper */}
                            <div className="relative overflow-hidden rounded-[32px] p-8 flex flex-col h-full">
                                {/* Watermark step number */}
                                <div
                                    className="absolute bottom-2 right-2 font-black leading-none select-none pointer-events-none"
                                    style={{
                                        fontSize: 100,
                                        color: `${step.color}10`,
                                        fontVariantNumeric: "tabular-nums",
                                    }}
                                >
                                    {step.number}
                                </div>

                                {/* Icon */}
                                <div
                                    className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
                                    style={{
                                        background: step.iconBg,
                                        boxShadow: `0 8px 24px ${step.shadow}`,
                                    }}
                                >
                                    <step.Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                                </div>

                                <div className="relative z-10">
                                    <div
                                        className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                                        style={{ color: step.color }}
                                    >
                                        Step {step.number}
                                    </div>
                                    <h3 className="text-white font-bold text-lg mb-3 leading-snug tracking-wide">
                                        {step.title}
                                    </h3>
                                    <p className="text-white/55 text-[15px] leading-relaxed mb-6 font-light">
                                        {step.desc}
                                    </p>

                                    {/* Feature pills */}
                                    <div className="flex flex-wrap gap-2">
                                        {step.highlights.map((h) => (
                                            <span
                                                key={h}
                                                className="text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full"
                                                style={{
                                                    color: step.color,
                                                    background: `${step.color}18`,
                                                    border: `1px solid ${step.border}`,
                                                }}
                                            >
                                                {h}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </BorderGlow>
                    ))}
                </div>

            </div>
        </section>
    );
}
