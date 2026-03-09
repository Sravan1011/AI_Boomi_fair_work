"use client";

import SectionWrapper from "../SectionWrapper";
import Container from "../Container";
import FadeInOnScroll from "../FadeInOnScroll";
import PremiumCard from "../PremiumCard";
import CinematicImage from "../CinematicImage";

const cards = [
    {
        image: "/assets/hero/Global Connectivity Art.png",
        title: "Creative professionals worldwide",
        description:
            "Connect with verified designers, developers, and strategists. Every freelancer goes through on-chain verification before accessing the platform.",
    },
    {
        image: "/assets/hero/Futuristic Molecular Art.png",
        title: "Enterprise-grade infrastructure",
        description:
            "Built on Polygon with sub-second finality, FairWork processes escrow transactions at scale with near-zero gas costs.",
    },
    {
        image: "/assets/hero/Stylized Bitcoin Symbol.png",
        title: "Teams that trust the protocol",
        description:
            "From solo freelancers to distributed agencies, FairWork removes counterparty risk and enables trustless collaboration at global scale.",
    },
];

export default function InstitutionalSection() {
    return (
        <SectionWrapper id="institutional">
            <Container>
                <FadeInOnScroll>
                    <div className="max-w-3xl">
                        <h2 className="text-section-title text-text-primary">
                            Built for teams that demand{" "}
                            <span className="text-accent-indigo">transparency</span>
                        </h2>
                        <p className="mt-6 text-section-sub text-text-muted max-w-2xl">
                            Leading organizations and independent professionals trust FairWork
                            to secure their contracts and resolve disputes fairly.
                        </p>
                    </div>
                </FadeInOnScroll>

                <div className="mt-16 grid gap-8 md:grid-cols-3">
                    {cards.map((card, i) => (
                        <FadeInOnScroll key={i} delay={i * 0.1}>
                            <PremiumCard className="h-full">
                                {/* Fixed image container — explicit height, no fill prop */}
                                <div className="relative w-full" style={{ height: "220px" }}>
                                    <CinematicImage
                                        src={card.image}
                                        alt={card.title}
                                        fill
                                        className="!rounded-b-none !rounded-t-3xl h-full"
                                    />
                                </div>
                                <div className="p-8">
                                    <h3 className="text-lg font-medium text-text-primary">
                                        {card.title}
                                    </h3>
                                    <p className="mt-3 text-sm leading-relaxed text-text-muted">
                                        {card.description}
                                    </p>
                                </div>
                            </PremiumCard>
                        </FadeInOnScroll>
                    ))}
                </div>
            </Container>
        </SectionWrapper>
    );
}
