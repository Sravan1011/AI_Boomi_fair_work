"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import HeroSection from "@/components/landing/sections/HeroSection";
import MetricsSection from "@/components/landing/sections/MetricsSection";
import InstitutionalSection from "@/components/landing/sections/InstitutionalSection";
import FeatureChipsSection from "@/components/landing/sections/FeatureChipsSection";
import ComparisonSection from "@/components/landing/sections/ComparisonSection";
import ArchitectureSection from "@/components/landing/sections/ArchitectureSection";
import CTAFooterSection from "@/components/landing/sections/CTAFooterSection";
import PromoCardsSection from "@/components/landing/sections/PromoCardsSection";
import CategoryIconsSection from "@/components/landing/sections/CategoryIconsSection";
import TechStripSection from "@/components/landing/sections/TechStripSection";
import FluidGlass from "@/components/landing/FluidGlass";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

function ScrollProgressBar() {
    const progressRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const tween = gsap.to(progressRef.current, {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
                trigger: document.documentElement,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.3
            }
        });
        return () => { tween.kill(); };
    }, []);
    return (
        <div
            ref={progressRef}
            className="fixed top-0 left-0 right-0 h-[3px] bg-[#17cf79] origin-left z-[9999]"
            style={{ transform: "scaleX(0)" }}
        />
    );
}

export default function LandingPage() {
    const heroRef = useRef<HTMLDivElement>(null);
    const nextRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero exits: fades + scales down as user scrolls away
            gsap.to(heroRef.current, {
                opacity: 0,
                scale: 0.94,
                y: -40,
                ease: "none",
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: "65% top",
                    end: "bottom top",
                    scrub: 1.2,
                },
            });

            // Next section rises in from below
            gsap.fromTo(
                nextRef.current,
                { opacity: 0, y: 70 },
                {
                    opacity: 1,
                    y: 0,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: nextRef.current,
                        start: "top 88%",
                        end: "top 40%",
                        scrub: 0.9,
                    },
                }
            );
        });

        return () => ctx.revert();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white">
            <ScrollProgressBar />
<LandingNavbar />

            <main className="relative z-10">
                {/* Hero with FluidGlass lens overlaid — small, cursor-following */}
                <div ref={heroRef} className="relative overflow-hidden">
                    <HeroSection />
                    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
                        <FluidGlass
                            mode="lens"
                            lensProps={{
                                scale: 0.25,
                                ior: 1.15,
                                thickness: 5,
                                chromaticAberration: 0.1,
                                anisotropy: 0.01,
                            }}
                        />
                    </div>
                    {/* gradient bleed into next section */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
                        style={{ background: "linear-gradient(to bottom, transparent, #000)" }} />
                </div>

                <TechStripSection />
                <div ref={nextRef}>
                    <CategoryIconsSection />
                </div>
                <MetricsSection />
                <InstitutionalSection />
                <PromoCardsSection />
                <FeatureChipsSection />
                <ArchitectureSection />
                <ComparisonSection />
                <CTAFooterSection />

            </main>

            <LandingFooter />
        </div>
    );
}
