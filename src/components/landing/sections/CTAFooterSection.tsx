"use client";

import Link from "next/link";
import Container from "../Container";
import FadeInOnScroll from "../FadeInOnScroll";
import GlowOrb from "../GlowOrb";

export default function CTAFooterSection() {
    return (
        <section className="relative py-section-lg overflow-hidden">
            {/* Background glow */}
            <GlowOrb
                color="indigo"
                size="900px"
                className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
            <GlowOrb
                color="violet"
                size="500px"
                className="bottom-0 right-1/4"
                animate
            />

            <Container className="relative z-10">
                <FadeInOnScroll>
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-hero text-text-primary">
                            Start working{" "}
                            <span className="bg-gradient-to-r from-accent-indigo to-accent-violet bg-clip-text text-transparent">
                                fairly.
                            </span>
                        </h2>
                        <p className="mt-8 text-hero-sub text-text-muted max-w-xl mx-auto">
                            Join the decentralized freelance economy. Secure contracts, fair
                            disputes, transparent governance.
                        </p>

                        <div className="mt-12 flex flex-wrap justify-center gap-4">
                            <Link
                                href="/jobs"
                                className="inline-flex items-center gap-2 rounded-pill bg-white px-10 py-4 text-base font-medium text-backdrop transition-all duration-300 hover:bg-white/90 hover:shadow-glow-md"
                            >
                                Launch App
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                >
                                    <path
                                        d="M6 3L11 8L6 13"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </Link>
                            <Link
                                href="#architecture"
                                className="inline-flex items-center gap-2 rounded-pill border border-surface-border px-10 py-4 text-base font-medium text-text-muted transition-all duration-300 hover:border-accent-indigo/40 hover:text-text-primary hover:bg-white/[0.03]"
                            >
                                Explore Docs
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                >
                                    <path
                                        d="M6 3L11 8L6 13"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </FadeInOnScroll>
            </Container>
        </section>
    );
}
