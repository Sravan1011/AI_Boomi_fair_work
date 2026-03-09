"use client";

import Link from "next/link";
import FadeInOnScroll from "../FadeInOnScroll";
import Container from "../Container";
import GlowOrb from "../GlowOrb";
import HeroImage3D from "../HeroImage3D";

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
                                    href="/register"
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
                        <HeroImage3D
                            src="/assets/hero/Stylized 3D Bitcoin Symbol.png"
                            alt="Professional 3D floating illustration for FairWork"
                        />
                    </FadeInOnScroll>

                </div>
            </Container>
        </section>
    );
}
