"use client";

import SectionWrapper from "../SectionWrapper";
import Container from "../Container";
import FadeInOnScroll from "../FadeInOnScroll";
import CinematicImage from "../CinematicImage";
import GlowOrb from "../GlowOrb";

const layers = [
    {
        name: "Smart Contract Layer",
        description:
            "FairWorkEscrow.sol — Handles job creation, USDC escrow, deadline enforcement, and automatic fund distribution. Built with OpenZeppelin security primitives.",
        color: "bg-accent-indigo",
    },
    {
        name: "AI Analysis Engine",
        description:
            "GPT-4o dispute analysis pipeline — Ingests job descriptions, deliverables, and evidence to produce structured, confidence-scored recommendations for jurors.",
        color: "bg-accent-violet",
    },
    {
        name: "Jury DAO",
        description:
            "Decentralized arbitration — 3 randomly selected jurors review evidence and AI analysis, cast on-chain votes, and trigger automatic contract resolution.",
        color: "bg-blue-500",
    },
    {
        name: "IPFS Evidence Layer",
        description:
            "Pinata-powered immutable storage — All deliverables, job specs, and dispute evidence are content-addressed on IPFS for tamper-proof transparency.",
        color: "bg-emerald-500",
    },
];

export default function ArchitectureSection() {
    return (
        <SectionWrapper id="architecture">
            <div className="relative">
                <GlowOrb
                    color="violet"
                    size="500px"
                    className="top-0 right-0 -translate-y-1/2 translate-x-1/3"
                />

                <Container>
                    <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
                        {/* Left: explanation */}
                        <div>
                            <FadeInOnScroll>
                                <h2 className="text-section-title text-text-primary">
                                    The FairWork Protocol
                                </h2>
                                <p className="mt-6 text-section-sub text-text-muted">
                                    Four interconnected layers work together to create a trustless
                                    freelancing infrastructure that protects every participant.
                                </p>
                            </FadeInOnScroll>

                            <div className="mt-12 space-y-6">
                                {layers.map((layer, i) => (
                                    <FadeInOnScroll key={i} delay={i * 0.1}>
                                        <div className="flex gap-5 group">
                                            <div className="flex flex-col items-center">
                                                <div
                                                    className={`h-3 w-3 rounded-full ${layer.color} shrink-0 mt-1.5 transition-transform duration-300 group-hover:scale-125`}
                                                />
                                                {i < layers.length - 1 && (
                                                    <div className="w-px h-full bg-surface-border mt-2" />
                                                )}
                                            </div>
                                            <div className="pb-6">
                                                <h4 className="text-base font-medium text-text-primary">
                                                    {layer.name}
                                                </h4>
                                                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                                                    {layer.description}
                                                </p>
                                            </div>
                                        </div>
                                    </FadeInOnScroll>
                                ))}
                            </div>
                        </div>

                        {/* Right: visual */}
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
                                        src="/images/landing/soundwave.png"
                                        alt="FairWork Protocol Architecture"
                                        width={640}
                                        height={480}
                                        className="w-full !rounded-none"
                                    />
                                </div>

                                {/* Floating protocol labels */}
                                <div className="absolute top-6 left-6 rounded-pill bg-backdrop/70 backdrop-blur-sm border border-surface-border px-4 py-2 text-xs text-text-muted">
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-indigo mr-2 animate-glow-pulse" />
                                    Smart Contract
                                </div>
                                <div className="absolute bottom-6 right-6 rounded-pill bg-backdrop/70 backdrop-blur-sm border border-surface-border px-4 py-2 text-xs text-text-muted">
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-violet mr-2 animate-glow-pulse" />
                                    AI Engine
                                </div>
                                <div className="absolute top-1/2 right-6 -translate-y-1/2 rounded-pill bg-backdrop/70 backdrop-blur-sm border border-surface-border px-4 py-2 text-xs text-text-muted">
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 mr-2 animate-glow-pulse" />
                                    Jury DAO
                                </div>
                            </div>
                        </FadeInOnScroll>
                    </div>
                </Container>
            </div>
        </SectionWrapper>
    );
}
