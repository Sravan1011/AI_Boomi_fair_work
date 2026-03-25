"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { Users, DollarSign, CheckCircle2, Zap } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

const CountUp = dynamic(() => import("react-countup"), { ssr: false });

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const STATS = [
    {
        Icon: Users,
        end: 12000,
        suffix: "+",
        label: "Active Freelancers",
        context: "Web3 specialists worldwide",
        color: "#1DBF73",
        iconBg: "#1DBF73",
        cardBg: "rgba(29,191,115,0.06)",
        border: "rgba(29,191,115,0.16)",
        glow: "rgba(29,191,115,0.12)",
    },
    {
        Icon: DollarSign,
        prefix: "$",
        end: 4.2,
        suffix: "M+",
        decimals: 1,
        label: "Escrowed to Date",
        context: "Secured in USDC payments",
        color: "#6366f1",
        iconBg: "#6366f1",
        cardBg: "rgba(99,102,241,0.06)",
        border: "rgba(99,102,241,0.16)",
        glow: "rgba(99,102,241,0.12)",
    },
    {
        Icon: CheckCircle2,
        end: 98,
        suffix: "%",
        label: "Disputes Resolved",
        context: "Fairly by AI arbitration",
        color: "#f59e0b",
        iconBg: "#f59e0b",
        cardBg: "rgba(245,158,11,0.06)",
        border: "rgba(245,158,11,0.16)",
        glow: "rgba(245,158,11,0.12)",
    },
    {
        Icon: Zap,
        prefix: "< ",
        end: 24,
        suffix: "h",
        label: "Avg. Hire Time",
        context: "From post to contract signed",
        color: "#0ea5e9",
        iconBg: "#0ea5e9",
        cardBg: "rgba(14,165,233,0.06)",
        border: "rgba(14,165,233,0.16)",
        glow: "rgba(14,165,233,0.12)",
    },
];

const BRANDS = ["Polygon", "Chainlink", "IPFS", "OpenZeppelin", "Uniswap", "Aave"];

export default function MetricsSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        // Stats grid entrance
        gsap.from(".stat-card", {
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 80%",
            },
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out"
        });

        // Brands entrance
        gsap.from(".brand-item", {
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 60%", // Triggers slightly later as user scrolls down
            },
            y: 20,
            opacity: 0,
            duration: 0.6,
            stagger: 0.05,
            ease: "power2.out"
        });
    }, { scope: sectionRef });

    return (
        <section ref={sectionRef} className="py-8 border-b border-white/5 relative z-10 backdrop-blur-[2px]">
            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">

                {/* Stats grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
                    {STATS.map((stat, i) => (
                        <div
                            key={stat.label}
                            className="stat-card group relative flex flex-col py-12 px-8 overflow-hidden transition-colors duration-500 hover:bg-white/5"
                        >
                            {/* Subtle corner glow on hover */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                                style={{ background: `radial-gradient(ellipse at top left, ${stat.glow} 0%, transparent 70%)` }}
                            />

                            {/* Icon */}
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
                                style={{ background: stat.iconBg, boxShadow: `0 8px 24px ${stat.glow}` }}
                            >
                                <stat.Icon className="w-[22px] h-[22px] text-white" strokeWidth={2.5} />
                            </div>

                            {/* Label */}
                            <div className="relative z-10 text-white/50 font-medium tracking-widest text-[11px] uppercase mb-1 drop-shadow-sm">
                                {stat.label}
                            </div>

                            {/* Number */}
                            <div
                                className="relative z-10 font-bold text-white tabular mb-3 drop-shadow-md"
                                style={{
                                    fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
                                    letterSpacing: "-0.04em",
                                    lineHeight: 1,
                                }}
                            >
                                {stat.prefix ?? ""}
                                <CountUp
                                    end={stat.end}
                                    decimals={stat.decimals ?? 0}
                                    separator=","
                                    duration={2.5}
                                    enableScrollSpy
                                    scrollSpyOnce
                                />
                                {stat.suffix}
                            </div>

                            {/* Context */}
                            <div className="relative z-10 text-[#A1A1AA] text-sm leading-relaxed font-light">
                                {stat.context}
                            </div>

                            {/* Bottom accent line */}
                            <div
                                className="absolute bottom-0 left-8 right-8 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{ background: stat.color, boxShadow: `0 -2px 10px ${stat.color}` }}
                            />
                        </div>
                    ))}
                </div>

                {/* Powered by strip */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 pt-10 pb-6 border-t border-white/5">
                    <span className="brand-item text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] flex-shrink-0 whitespace-nowrap">
                        Powered by
                    </span>
                    <div className="flex items-center flex-wrap justify-center md:justify-end gap-x-10 gap-y-4">
                        {BRANDS.map((brand, i) => (
                            <span
                                key={brand}
                                className="brand-item text-sm font-semibold text-white/50 hover:text-white transition-colors duration-300 cursor-default"
                            >
                                {brand}
                            </span>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
