"use client";

import Link from "next/link";
import FadeInOnScroll from "../FadeInOnScroll";
import Container from "../Container";
import GlowOrb from "../GlowOrb";
import CinematicImage from "../CinematicImage";

export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center overflow-hidden">
            {/* Background glow orbs */}
            <div className="absolute inset-0 pointer-events-none">
                <GlowOrb
                    color="indigo"
                    size="700px"
                    className="top-1/2 left-0 -translate-x-1/3 -translate-y-1/2"
                />
                <GlowOrb
                    color="violet"
                    size="500px"
                    className="top-1/4 right-0 translate-x-1/4"
                    animate
                />
                <GlowOrb
                    color="blue"
                    size="350px"
                    className="bottom-0 right-1/4"
                    animate
                />
                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-backdrop to-transparent" />
            </div>

            <Container className="relative z-10 pt-hero-top pb-section">
                <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">

                    {/* LEFT — Text content */}
                    <div>
                        <FadeInOnScroll>
                            <div className="inline-flex items-center gap-2 rounded-pill border border-accent-indigo/30 bg-accent-indigo/10 px-4 py-1.5 text-xs text-accent-indigo mb-8">
                                <span className="h-1.5 w-1.5 rounded-full bg-accent-indigo animate-glow-pulse" />
                                Polygon Mainnet · Audited by OpenZeppelin
                            </div>
                        </FadeInOnScroll>

                        <FadeInOnScroll delay={0.1}>
                            <h1 className="text-hero text-text-primary font-light">
                                The infrastructure for fair,{" "}
                                <span className="bg-gradient-to-r from-accent-indigo to-accent-violet bg-clip-text text-transparent">
                                    trustless
                                </span>{" "}
                                freelancing.
                            </h1>
                        </FadeInOnScroll>

                        <FadeInOnScroll delay={0.2}>
                            <p className="mt-8 text-hero-sub text-text-muted max-w-lg">
                                AI-powered dispute resolution with on-chain escrow and
                                decentralized jury governance. Secure every contract. Protect
                                every payment.
                            </p>
                        </FadeInOnScroll>

                        <FadeInOnScroll delay={0.3}>
                            <div className="mt-12 flex flex-wrap gap-4">
                                <Link
                                    href="/jobs"
                                    className="inline-flex items-center gap-2 rounded-pill bg-white px-8 py-3.5 text-sm font-medium text-backdrop transition-all duration-300 hover:bg-white/90 hover:shadow-glow-sm"
                                >
                                    Launch App
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1">
                                        <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Link>
                                <Link
                                    href="#architecture"
                                    className="inline-flex items-center gap-2 rounded-pill border border-surface-border px-8 py-3.5 text-sm font-medium text-text-muted transition-all duration-300 hover:border-accent-indigo/40 hover:text-text-primary hover:bg-white/[0.03]"
                                >
                                    Read Docs
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1">
                                        <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Link>
                            </div>
                        </FadeInOnScroll>

                        {/* Trust badges */}
                        <FadeInOnScroll delay={0.4}>
                            <div className="mt-14 flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-2xl font-light text-text-primary">$2.5M+</p>
                                    <p className="text-xs text-text-subtle mt-1">Secured in Escrow</p>
                                </div>
                                <div className="h-8 w-px bg-surface-border" />
                                <div className="text-center">
                                    <p className="text-2xl font-light text-text-primary">1,200+</p>
                                    <p className="text-xs text-text-subtle mt-1">Jobs Completed</p>
                                </div>
                                <div className="h-8 w-px bg-surface-border" />
                                <div className="text-center">
                                    <p className="text-2xl font-light text-text-primary">99.7%</p>
                                    <p className="text-xs text-text-subtle mt-1">Resolution Rate</p>
                                </div>
                            </div>
                        </FadeInOnScroll>
                    </div>

                    {/* RIGHT — Hero abstract image */}
                    <FadeInOnScroll direction="right" delay={0.2}>
                        <div className="relative">
                            {/* 4-directional feathered mask — fades all edges into background */}
                            <div
                                style={{
                                    WebkitMaskImage: [
                                        "linear-gradient(to right,  transparent 0%, black 18%, black 82%, transparent 100%)",
                                        "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
                                    ].join(", "),
                                    WebkitMaskComposite: "source-in",
                                    maskImage: [
                                        "linear-gradient(to right,  transparent 0%, black 18%, black 82%, transparent 100%)",
                                        "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
                                    ].join(", "),
                                    maskComposite: "intersect",
                                }}
                            >
                                <CinematicImage
                                    src="/assets/hero/hero-abstract.png"
                                    alt="FairWork decentralized protocol network"
                                    width={640}
                                    height={640}
                                    className="w-full !rounded-none"
                                    priority
                                />
                            </div>

                            {/* Floating stat card */}
                            <div className="absolute -bottom-4 -left-4 md:-left-8 rounded-2xl border border-surface-border bg-surface-elevated/90 backdrop-blur-xl p-4 shadow-glow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-accent-indigo/20 flex items-center justify-center">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-text-primary">Escrow Protected</p>
                                        <p className="text-xs text-text-muted">USDC · Smart Contract</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating network badge */}
                            <div className="absolute -top-4 -right-4 md:-right-6 rounded-2xl border border-surface-border bg-surface-elevated/90 backdrop-blur-xl px-4 py-3 shadow-glow-sm">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <p className="text-xs text-text-primary font-medium">Live on Polygon</p>
                                </div>
                            </div>
                        </div>
                    </FadeInOnScroll>

                </div>
            </Container>
        </section>
    );
}
