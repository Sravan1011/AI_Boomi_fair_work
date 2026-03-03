"use client";

import SectionWrapper from "../SectionWrapper";
import Container from "../Container";
import FadeInOnScroll from "../FadeInOnScroll";

const comparisons = [
    {
        name: "Traditional Freelancing",
        highlight: false,
        rows: {
            fees: "15–20% commission",
            dispute: "Manual review (weeks)",
            payment: "Bank transfer (3–5 days)",
            trust: "Platform reputation only",
            control: "Platform-owned data",
        },
    },
    {
        name: "Centralized Crypto",
        highlight: false,
        rows: {
            fees: "5–10% commission",
            dispute: "Support tickets",
            payment: "Crypto (variable)",
            trust: "Custodial wallets",
            control: "Centralized servers",
        },
    },
    {
        name: "FairWork",
        highlight: true,
        rows: {
            fees: "2.5% flat fee",
            dispute: "AI + Jury (< 24hrs)",
            payment: "USDC (instant)",
            trust: "Smart contract escrow",
            control: "Decentralized + IPFS",
        },
    },
];

const rowLabels: Record<string, string> = {
    fees: "Platform Fees",
    dispute: "Dispute Resolution",
    payment: "Payment Speed",
    trust: "Trust Model",
    control: "Data Ownership",
};

export default function ComparisonSection() {
    return (
        <SectionWrapper id="comparison">
            <Container>
                <FadeInOnScroll>
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-section-title text-text-primary">
                            How FairWork compares
                        </h2>
                        <p className="mt-6 text-section-sub text-text-muted">
                            See how decentralized escrow outperforms traditional and centralized alternatives.
                        </p>
                    </div>
                </FadeInOnScroll>

                {/* Desktop table view */}
                <FadeInOnScroll delay={0.15}>
                    <div className="mt-16 hidden md:block">
                        <div className="grid grid-cols-4 gap-0 rounded-3xl border border-surface-border overflow-hidden">
                            {/* Header row */}
                            <div className="bg-surface-elevated/40 p-6 border-b border-surface-border" />
                            {comparisons.map((c, i) => (
                                <div
                                    key={i}
                                    className={`p-6 border-b border-l border-surface-border text-center ${c.highlight
                                            ? "bg-accent-indigo/[0.06] border-t-2 border-t-accent-indigo"
                                            : "bg-surface-elevated/40"
                                        }`}
                                >
                                    <h3
                                        className={`text-base font-medium ${c.highlight ? "text-accent-indigo" : "text-text-primary"
                                            }`}
                                    >
                                        {c.name}
                                    </h3>
                                </div>
                            ))}

                            {/* Data rows */}
                            {Object.keys(rowLabels).map((key, ri) => (
                                <>
                                    <div
                                        key={`label-${key}`}
                                        className={`p-6 text-sm text-text-muted bg-surface/30 ${ri < Object.keys(rowLabels).length - 1
                                                ? "border-b border-surface-border"
                                                : ""
                                            }`}
                                    >
                                        {rowLabels[key]}
                                    </div>
                                    {comparisons.map((c, ci) => (
                                        <div
                                            key={`${key}-${ci}`}
                                            className={`p-6 text-sm text-center border-l border-surface-border ${ri < Object.keys(rowLabels).length - 1
                                                    ? "border-b border-surface-border"
                                                    : ""
                                                } ${c.highlight
                                                    ? "bg-accent-indigo/[0.04] text-text-primary font-medium"
                                                    : "bg-surface/20 text-text-muted"
                                                }`}
                                        >
                                            {c.rows[key as keyof typeof c.rows]}
                                        </div>
                                    ))}
                                </>
                            ))}
                        </div>
                    </div>
                </FadeInOnScroll>

                {/* Mobile card view */}
                <div className="mt-16 md:hidden space-y-6">
                    {comparisons.map((c, i) => (
                        <FadeInOnScroll key={i} delay={i * 0.1}>
                            <div
                                className={`rounded-3xl border p-6 ${c.highlight
                                        ? "border-accent-indigo/40 bg-accent-indigo/[0.06]"
                                        : "border-surface-border bg-surface-elevated/40"
                                    }`}
                            >
                                <h3
                                    className={`text-base font-medium mb-5 ${c.highlight ? "text-accent-indigo" : "text-text-primary"
                                        }`}
                                >
                                    {c.name}
                                </h3>
                                <div className="space-y-4">
                                    {Object.keys(rowLabels).map((key) => (
                                        <div
                                            key={key}
                                            className="flex justify-between text-sm"
                                        >
                                            <span className="text-text-subtle">
                                                {rowLabels[key]}
                                            </span>
                                            <span
                                                className={
                                                    c.highlight
                                                        ? "text-text-primary font-medium"
                                                        : "text-text-muted"
                                                }
                                            >
                                                {c.rows[key as keyof typeof c.rows]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </FadeInOnScroll>
                    ))}
                </div>
            </Container>
        </SectionWrapper>
    );
}
