"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface PromoSectionProps {
    variant: "web3" | "escrow";
}

export default function PromoSection({ variant }: PromoSectionProps) {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const content = sectionRef.current?.querySelectorAll(".promo-reveal");
            if (!content) return;
            gsap.from(content, {
                opacity: 0,
                x: variant === "web3" ? -40 : 40,
                stagger: 0.12,
                duration: 0.9,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 82%",
                    toggleActions: "play none none none",
                }
            });

            gsap.from(".promo-img-" + variant, {
                opacity: 0,
                scale: 0.9,
                x: variant === "web3" ? 60 : -60,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 82%",
                    toggleActions: "play none none none",
                }
            });
        }, sectionRef);
        return () => ctx.revert();
    }, [variant]);

    if (variant === "web3") {
        return (
            <section className="container-custom py-8">
                <div ref={sectionRef} className="promo-card">
                    <div className="promo-card-inner grid lg:grid-cols-2 gap-10 items-center">
                        <div>
                            <span className="promo-accent promo-reveal">Web3 Development</span>
                            <h2 className="promo-headline promo-reveal">
                                Need help with<br />
                                <span className="gradient-word">Web3 development?</span>
                            </h2>
                            <p className="promo-body promo-reveal">
                                Get matched with the right expert to keep building and scaling your project at lightning speed.
                            </p>
                            <Link href="/jobs" className="btn-magnetic btn-primary-glow promo-reveal" style={{ display: "inline-flex" }}>
                                Find an expert <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="relative h-64 lg:h-80">
                            <Image
                                src="/images/promo-workspace.png"
                                alt="Web3 Workspace"
                                fill
                                className={`object-contain object-right promo-img-web3`}
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="container-custom py-8">
            <div ref={sectionRef} className="promo-card">
                <div className="promo-card-inner grid lg:grid-cols-2 gap-10 items-center">
                    <div className="relative h-64 lg:h-80 order-2 lg:order-1">
                        <Image
                            src="/images/colorful-cans.png"
                            alt="Secure Escrow"
                            fill
                            className={`object-contain object-left promo-img-escrow`}
                            sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                    </div>
                    <div className="order-1 lg:order-2">
                        <span className="promo-accent promo-reveal">Secure Payments</span>
                        <h2 className="promo-headline promo-reveal">
                            Payments secured<br />
                            <span className="gradient-word">in seconds.</span>
                        </h2>
                        <p className="promo-body promo-reveal">
                            Smart contract escrow. Funds release only when you approve.
                            No bank. No middleman. Just code.
                        </p>
                        <Link href="/jobs/create" className="btn-magnetic btn-primary-glow promo-reveal" style={{ display: "inline-flex" }}>
                            Try Secure Escrow <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
