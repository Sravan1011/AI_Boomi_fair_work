"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";


const TAGS = ["Smart Contracts", "Web3 Apps", "AI Agents", "DeFi", "NFT Projects"];

export default function HeroSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const orb1Ref = useRef<HTMLDivElement>(null);
    const orb2Ref = useRef<HTMLDivElement>(null);
    const orb3Ref = useRef<HTMLDivElement>(null);
    const eyebrowRef = useRef<HTMLDivElement>(null);
    const subRef = useRef<HTMLParagraphElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const tagsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        const ctx = gsap.context(() => {
            // ── Entrance timeline ──────────────────────────────
            const tl = gsap.timeline({ delay: 0.1 });

            // Eyebrow badge
            tl.fromTo(eyebrowRef.current,
                { opacity: 0, y: 20, filter: "blur(8px)" },
                { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: "power3.out" }
            );

            // Words in line 1
            tl.fromTo(".hero-word-1",
                { yPercent: 110, opacity: 0 },
                { yPercent: 0, opacity: 1, stagger: 0.07, duration: 0.8, ease: "power4.out" },
                "-=0.3"
            );

            // Words in line 2
            tl.fromTo(".hero-word-2",
                { yPercent: 110, opacity: 0 },
                { yPercent: 0, opacity: 1, stagger: 0.07, duration: 0.8, ease: "power4.out" },
                "-=0.6"
            );

            // Sub text
            tl.fromTo(subRef.current,
                { opacity: 0, y: 20, filter: "blur(6px)" },
                { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: "power3.out" },
                "-=0.4"
            );

            // Search bar
            tl.fromTo(searchRef.current,
                { opacity: 0, y: 24, scale: 0.97 },
                { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" },
                "-=0.3"
            );

            // Tags stagger
            tl.fromTo(tagsRef.current,
                { opacity: 0, y: 16 },
                { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
                "-=0.3"
            );

            // ── Orb parallax on scroll ─────────────────────────
            gsap.to(orb1Ref.current, {
                yPercent: -30,
                ease: "none",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: 1.5,
                }
            });

            gsap.to(orb2Ref.current, {
                yPercent: -50,
                xPercent: 10,
                ease: "none",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: 2,
                }
            });

            gsap.to(orb3Ref.current, {
                scale: 1.4,
                ease: "none",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: 1,
                }
            });

            // ── Hero content parallax ──────────────────────────
            gsap.to(".hero-content", {
                yPercent: 20,
                opacity: 0.4,
                ease: "none",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "center top",
                    end: "bottom top",
                    scrub: 1.2,
                }
            });

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    // Magnetic button effect
    const handleMagnet = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        gsap.to(btn, { x: dx * 0.35, y: dy * 0.35, duration: 0.4, ease: "power3.out" });
    };

    const handleMagnetLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
        gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.4)" });
    };

    return (
        <section ref={sectionRef} className="hero-section">
            {/* Background orbs */}
            <div ref={orb1Ref} className="hero-gradient-orb orb-1" aria-hidden="true" />
            <div ref={orb2Ref} className="hero-gradient-orb orb-2" aria-hidden="true" />
            <div ref={orb3Ref} className="hero-gradient-orb orb-3" aria-hidden="true" />

            {/* Subtle grid */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)`,
                    backgroundSize: "60px 60px",
                }}
                aria-hidden="true"
            />

            <div className="hero-content relative z-10 container-custom w-full py-24 lg:py-40">
                <div className="max-w-3xl">
                    {/* Eyebrow */}
                    <div ref={eyebrowRef} className="hero-eyebrow">
                        <span className="hero-eyebrow-dot" />
                        Now live on Polygon Amoy
                    </div>

                    {/* Headline — two lines with per-word animation */}
                    <h1 style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: "clamp(3rem, 8vw, 6.5rem)",
                        fontWeight: 700,
                        lineHeight: 1.05,
                        letterSpacing: "-0.04em",
                        color: "var(--text)",
                        marginBottom: 28,
                    }}>
                        {/* Line 1 — overflow:hidden clips the upward slide-in */}
                        <div style={{ overflow: "hidden", display: "block" }}>
                            {["Find", "the", "perfect"].map((w, i) => (
                                <span key={i} className="hero-word-1" style={{ display: "inline-block", marginRight: "0.22em" }}>{w}</span>
                            ))}
                        </div>
                        {/* Line 2 */}
                        <div style={{ overflow: "hidden", display: "block" }}>
                            <span className="hero-word-2 gradient-word" style={{ display: "inline-block", marginRight: "0.22em" }}>freelance</span>
                            <span className="hero-word-2" style={{ display: "inline-block", marginRight: "0.22em" }}>services</span>
                            <span className="hero-word-2" style={{ display: "inline-block", marginRight: "0.22em" }}>on</span>
                            <span className="hero-word-2 gradient-word" style={{ display: "inline-block" }}>Web3.</span>
                        </div>
                    </h1>

                    {/* Subheadline */}
                    <p ref={subRef} className="hero-sub">
                        Secure escrow payments. AI-powered dispute resolution.
                        The fairest freelance platform ever built.
                    </p>

                    {/* Search */}
                    <div ref={searchRef} className="hero-search-bar max-w-xl mb-5">
                        <Search className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" />
                        <input
                            type="text"
                            placeholder='Try "Smart Contract Development"'
                            aria-label="Search for services"
                        />
                        <Link
                            href="/jobs"
                            className="btn-magnetic btn-primary-glow text-sm"
                            onMouseMove={handleMagnet}
                            onMouseLeave={handleMagnetLeave}
                        >
                            Search <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Tags */}
                    <div ref={tagsRef} className="hero-tags">
                        <span style={{ color: "var(--text-subtle)", fontSize: "0.82rem", display: "flex", alignItems: "center" }}>Popular:</span>
                        {TAGS.map((tag) => (
                            <Link key={tag} href="/jobs" className="hero-tag hover-magnetic">{tag}</Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
