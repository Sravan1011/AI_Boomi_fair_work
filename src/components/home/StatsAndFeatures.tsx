"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stats = [
    { value: "2.5%", label: "Platform Fee — lowest in web3" },
    { value: "$0", label: "Hidden charges, ever" },
    { value: "24h", label: "Avg dispute resolution" },
    { value: "100%", label: "On-chain transparency" },
];

const companies = ["Polygon", "OpenAI", "Supabase", "RainbowKit", "IPFS"];

export function StatsBar() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Stat values count-up effect
            gsap.from(".stat-item", {
                opacity: 0,
                y: 30,
                stagger: 0.12,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 88%",
                    toggleActions: "play none none none",
                }
            });

            // Trust logos marquee entrance
            gsap.from(".trust-logo", {
                opacity: 0,
                y: 12,
                stagger: 0.08,
                duration: 0.6,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ".trust-strip",
                    start: "top 90%",
                    toggleActions: "play none none none",
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <>
            {/* Trust strip */}
            <section className="trust-strip py-8 border-b border-[var(--border)]" style={{ background: "var(--bg-2)" }}>
                <div className="container-custom">
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
                        <span style={{ color: "var(--text-subtle)", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                            Built with
                        </span>
                        {companies.map((co) => (
                            <span key={co} className="trust-logo">{co}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section ref={sectionRef} className="stats-bar">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat) => (
                            <div key={stat.label} className="stat-item">
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}

export function FeaturesSection() {
    const sectionRef = useRef<HTMLElement>(null);

    const features = [
        { icon: "⚡", title: "Instant matching", desc: "Smart recommendations based on your skills and history" },
        { icon: "🔒", title: "Escrow security", desc: "USDC locked in smart contract until work is approved" },
        { icon: "⚖️", title: "Fair disputes", desc: "AI analysis + DAO jury resolves conflicts in 24h" },
        { icon: "💎", title: "Lowest fees", desc: "Only 2.5% — no hidden costs, no middleman markup" },
    ];

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".feature-card", {
                opacity: 0,
                y: 40,
                stagger: 0.1,
                duration: 0.7,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 85%",
                    toggleActions: "play none none none",
                }
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-24" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="container-custom">
                <div className="text-center mb-14">
                    <p className="section-eyebrow">Why FairWork</p>
                    <h2 className="section-headline">
                        Built different.<br />
                        <span className="gradient-word">For builders.</span>
                    </h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {features.map((f) => (
                        <div key={f.title} className="feature-card minimal-card text-left">
                            <div className="text-3xl mb-4">{f.icon}</div>
                            <h3 className="font-700 mb-2" style={{ color: "var(--text)", fontWeight: 700, fontSize: "1rem" }}>{f.title}</h3>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.87rem", lineHeight: 1.65 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
