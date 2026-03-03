"use client";

import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import NoiseOverlay from "@/components/landing/NoiseOverlay";
import GridOverlay from "@/components/landing/GridOverlay";
import HeroSection from "@/components/landing/sections/HeroSection";
import MetricsSection from "@/components/landing/sections/MetricsSection";
import InstitutionalSection from "@/components/landing/sections/InstitutionalSection";
import FeatureChipsSection from "@/components/landing/sections/FeatureChipsSection";
import ComparisonSection from "@/components/landing/sections/ComparisonSection";
import ArchitectureSection from "@/components/landing/sections/ArchitectureSection";
import CTAFooterSection from "@/components/landing/sections/CTAFooterSection";

export default function LandingPage() {
    return (
        <div className="relative min-h-screen bg-backdrop text-text-primary">
            {/* Global overlays */}
            <NoiseOverlay />
            <GridOverlay />

            {/* Navigation */}
            <LandingNavbar />

            {/* Page sections */}
            <main>
                <HeroSection />
                <MetricsSection />
                <InstitutionalSection />
                <FeatureChipsSection />
                <ComparisonSection />
                <ArchitectureSection />
                <CTAFooterSection />
            </main>

            {/* Footer */}
            <LandingFooter />
        </div>
    );
}
