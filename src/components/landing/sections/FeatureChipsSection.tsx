"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionWrapper from "../SectionWrapper";
import Container from "../Container";
import FadeInOnScroll from "../FadeInOnScroll";
import Chip from "../Chip";

const features = [
    {
        id: "escrow",
        label: "Smart Escrow",
        title: "Trustless payment protection",
        description:
            "USDC is locked in an audited smart contract the moment a job is created. Funds are only released when both parties agree — or when a dispute is resolved by the jury. No middlemen. No chargebacks. No trust required.",
        highlights: ["USDC-based payments", "2.5% platform fee", "ReentrancyGuard protected", "OpenZeppelin audited"],
    },
    {
        id: "ai",
        label: "AI Disputes",
        title: "Intelligent conflict analysis",
        description:
            "When disputes arise, our AI engine analyzes job descriptions, deliverables, and submitted evidence to generate a structured, confidence-scored recommendation. This analysis is presented to jurors alongside all evidence.",
        highlights: ["GPT-4o powered analysis", "Confidence scoring", "Evidence synthesis", "Structured recommendations"],
    },
    {
        id: "jury",
        label: "Jury System",
        title: "Decentralized resolution",
        description:
            "Three randomly selected jurors review the dispute evidence and AI analysis, then cast on-chain votes. The majority decision is final and funds are automatically distributed by the smart contract.",
        highlights: ["3 random jurors", "On-chain voting", "Automatic resolution", "Transparent verdicts"],
    },
    {
        id: "ipfs",
        label: "IPFS Storage",
        title: "Immutable evidence chain",
        description:
            "All job descriptions, deliverables, and evidence files are stored on IPFS via Pinata. This creates an immutable, tamper-proof record that cannot be altered after submission — ensuring complete transparency.",
        highlights: ["Pinata integration", "Immutable records", "Tamper-proof evidence", "Decentralized storage"],
    },
    {
        id: "dao",
        label: "DAO Governance",
        title: "Community-driven protocol",
        description:
            "FairWork is governed by its participants. Jurors stake tokens to participate, earn rewards for accurate verdicts, and collectively decide on protocol upgrades through transparent on-chain governance.",
        highlights: ["Juror staking", "Reward incentives", "Protocol upgrades", "On-chain governance"],
    },
];

export default function FeatureChipsSection() {
    const [active, setActive] = useState("escrow");
    const activeFeature = features.find((f) => f.id === active)!;

    return (
        <SectionWrapper id="features">
            <Container>
                <FadeInOnScroll>
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-section-title text-text-primary">
                            Why choose FairWork?
                        </h2>
                        <p className="mt-6 text-section-sub text-text-muted">
                            Every layer of the protocol is designed for security, fairness, and
                            transparency.
                        </p>
                    </div>
                </FadeInOnScroll>

                <FadeInOnScroll delay={0.15}>
                    <div className="mt-14 flex flex-wrap justify-center gap-3">
                        {features.map((f) => (
                            <Chip
                                key={f.id}
                                label={f.label}
                                active={active === f.id}
                                onClick={() => setActive(f.id)}
                            />
                        ))}
                    </div>
                </FadeInOnScroll>

                <div className="mt-16 min-h-[280px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={active}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="rounded-3xl border border-surface-border bg-surface-elevated/40 backdrop-blur-sm p-10 md:p-14"
                        >
                            <div className="grid md:grid-cols-2 gap-12 items-start">
                                <div>
                                    <h3 className="text-2xl font-light text-text-primary tracking-tight">
                                        {activeFeature.title}
                                    </h3>
                                    <p className="mt-5 text-base leading-relaxed text-text-muted">
                                        {activeFeature.description}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {activeFeature.highlights.map((h, i) => (
                                        <div
                                            key={i}
                                            className="rounded-2xl border border-surface-border bg-surface/60 px-5 py-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-2 w-2 rounded-full bg-accent-indigo" />
                                                <span className="text-sm text-text-primary">{h}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </Container>
        </SectionWrapper>
    );
}
