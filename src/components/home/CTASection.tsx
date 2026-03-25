"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";


export default function CTASection() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                    toggleActions: "play none none none",
                }
            });

            tl.from(".cta-headline", {
                opacity: 0, y: 50, filter: "blur(10px)",
                duration: 0.9, ease: "power3.out",
            })
                .from(".cta-sub", {
                    opacity: 0, y: 24,
                    duration: 0.7, ease: "power3.out",
                }, "-=0.4")
                .from(".cta-btn", {
                    opacity: 0, y: 20, scale: 0.95,
                    stagger: 0.1,
                    duration: 0.6, ease: "back.out(1.5)",
                }, "-=0.3");
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const handleMagnet = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        gsap.to(btn, { x: dx * 0.35, y: dy * 0.35, duration: 0.4, ease: "power3.out" });
    };

    const handleMagnetLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
        gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.4)" });
    };

    return (
        <section ref={sectionRef} className="cta-section">
            <div className="container-custom relative z-10">
                <h2 className="cta-headline">
                    Ready to work<br />
                    <span className="gradient-word">fairly?</span>
                </h2>
                <p className="cta-sub">
                    Connect your wallet and experience the future of freelancing.
                    No signup. No fees until you get paid.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                    <Link
                        href="/jobs/create"
                        className="cta-btn btn-magnetic btn-primary-glow"
                        onMouseMove={handleMagnet}
                        onMouseLeave={handleMagnetLeave}
                    >
                        Post a Job <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/jobs"
                        className="cta-btn btn-magnetic btn-ghost"
                        onMouseMove={handleMagnet}
                        onMouseLeave={handleMagnetLeave}
                    >
                        Browse Opportunities
                    </Link>
                </div>
            </div>
        </section>
    );
}
