"use client";

import Container from "../Container";
import FadeInOnScroll from "../FadeInOnScroll";
import MetricCounter from "../MetricCounter";

const metrics = [
    { end: 2.5, prefix: "$", suffix: "M+", label: "Secured in Escrow", decimals: 1 },
    { end: 1200, prefix: "", suffix: "+", label: "Jobs Completed", decimals: 0 },
    { end: 99.7, prefix: "", suffix: "%", label: "Resolution Rate", decimals: 1 },
    { end: 0.5, prefix: "<", suffix: "%", label: "Platform Fee", decimals: 1 },
];

export default function MetricsSection() {
    return (
        <section className="relative">
            <Container>
                <FadeInOnScroll>
                    <div className="border-y border-surface-border py-16 md:py-20">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
                            {metrics.map((metric, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-metric text-text-primary">
                                        <MetricCounter
                                            end={metric.end}
                                            prefix={metric.prefix}
                                            suffix={metric.suffix}
                                            decimals={metric.decimals}
                                        />
                                    </div>
                                    <p className="mt-3 text-sm text-text-muted tracking-wide uppercase">
                                        {metric.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </FadeInOnScroll>
            </Container>
        </section>
    );
}
