"use client";

import { useRef } from "react";
import { Check, X } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const ROWS = [
    { feature: "Escrow-protected payments",   fairwork: true,  others: false },
    { feature: "AI dispute resolution",        fairwork: true,  others: false },
    { feature: "On-chain transparency",        fairwork: true,  others: false },
    { feature: "Non-custodial wallet support", fairwork: true,  others: false },
    { feature: "Flat 2.5% fee",                fairwork: true,  others: false },
    { feature: "Decentralized arbitration",    fairwork: true,  others: false },
    { feature: "Instant USDC payments",        fairwork: true,  others: false },
    { feature: "Hidden fees / chargebacks",    fairwork: false, others: true  },
];

export default function ComparisonSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        gsap.from(".comp-header", {
            scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
            y: 40, opacity: 0, duration: 1, ease: "power3.out"
        });

        gsap.from(".comp-table", {
            scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
            y: 60, opacity: 0, duration: 1.2, ease: "power3.out"
        });

        gsap.from(".comp-row", {
            scrollTrigger: { trigger: ".comp-table", start: "top 70%" },
            x: -20, opacity: 0, duration: 0.6, stagger: 0.05, ease: "power2.out"
        });
        
        gsap.from(".comp-fairwork-check", {
            scrollTrigger: { trigger: ".comp-table", start: "top 60%" },
            scale: 0, opacity: 0, duration: 0.4, stagger: 0.05, ease: "back.out(2)", delay: 0.3
        });
    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} className="py-24 md:py-32 border-b border-white/5 relative z-10 backdrop-blur-[2px]">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="comp-header text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-[#1DBF73] flex-shrink-0 shadow-[0_0_8px_#1DBF73]" />
                        <span className="text-white/80 text-xs font-semibold uppercase tracking-[0.2em]">The Difference</span>
                    </div>
                    <h2
                        className="font-extrabold text-white mb-5 tracking-tight"
                        style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1.1 }}
                    >
                        FairWork vs. Traditional Platforms
                    </h2>
                    <p className="text-[#A1A1AA] text-lg max-w-lg mx-auto leading-relaxed font-light">
                        See why Web3 freelancers choose FairWork over traditional Web2 alternatives.
                    </p>
                </div>

                {/* Table card */}
                <div
                    className="comp-table rounded-[2rem] overflow-hidden border border-white/10 backdrop-blur-2xl"
                    style={{
                        background: "linear-gradient(145deg, rgba(20,20,25,0.7) 0%, rgba(10,10,12,0.8) 100%)",
                        boxShadow: "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05)",
                    }}
                >
                    {/* Column headers */}
                    <div className="grid grid-cols-3 border-b border-white/10" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <div className="py-6 px-6 sm:px-8 text-xs font-bold text-white/40 uppercase tracking-[0.2em]">
                            Feature
                        </div>

                        {/* FairWork column — highlighted */}
                        <div className="py-6 px-4 sm:px-8 text-center bg-[#1DBF73]/10 border-x border-[#1DBF73]/20 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-[#1DBF73]/20 to-transparent opacity-50 pointer-events-none" />
                            <div className="inline-flex items-center justify-center gap-2.5 relative z-10">
                                <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-[#1DBF73] shadow-[0_0_15px_rgba(29,191,115,0.5)]">
                                    <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
                                        <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span className="text-base font-bold text-white tracking-wide">FairWork</span>
                            </div>
                        </div>

                        <div className="py-6 px-4 sm:px-8 text-center text-xs font-bold text-white/40 uppercase tracking-[0.2em]">
                            Others
                        </div>
                    </div>

                    {/* Rows */}
                    {ROWS.map((row, i) => (
                        <div
                            key={row.feature}
                            className={`comp-row grid grid-cols-3 border-b last:border-0 border-white/5 transition-colors duration-300 hover:bg-white/[0.03] ${i % 2 === 0 ? "bg-transparent" : "bg-white/[0.01]"}`}
                        >
                            <div className="py-5 px-6 sm:px-8 text-[14px] sm:text-[15px] font-medium text-white/80 flex items-center">
                                {row.feature}
                            </div>

                            {/* FairWork cell */}
                            <div className="py-5 px-4 sm:px-8 flex justify-center items-center bg-[#1DBF73]/[0.05] border-x border-[#1DBF73]/10 transition-colors duration-300 hover:bg-[#1DBF73]/[0.15]">
                                {row.fairwork ? (
                                    <span className="comp-fairwork-check w-8 h-8 rounded-full bg-[#1DBF73]/20 border border-[#1DBF73]/40 flex items-center justify-center shadow-[0_0_15px_rgba(29,191,115,0.2)]">
                                        <Check className="w-4 h-4 text-[#1DBF73]" strokeWidth={3} />
                                    </span>
                                ) : (
                                    <span className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                        <X className="w-4 h-4 text-red-500/70" strokeWidth={2.5} />
                                    </span>
                                )}
                            </div>

                            {/* Others cell */}
                            <div className="py-5 px-4 sm:px-8 flex justify-center items-center">
                                {row.others ? (
                                    <span className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-red-500/70" strokeWidth={3} />
                                    </span>
                                ) : (
                                    <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                        <X className="w-4 h-4 text-white/30" strokeWidth={2.5} />
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
