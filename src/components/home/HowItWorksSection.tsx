"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Briefcase, Lock, Clock, Zap } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
    { n: "01", icon: Briefcase, title: "Post a Job", desc: "Describe your project, set your budget, and specify deadline." },
    { n: "02", icon: Lock, title: "Fund Escrow", desc: "Deposit USDC into a tamper-proof smart contract on Polygon." },
    { n: "03", icon: Clock, title: "Work Gets Done", desc: "Freelancer delivers. You review at your own pace." },
    { n: "04", icon: Zap, title: "Release & Go", desc: "Approve and funds flow instantly. 97.5% to the freelancer." },
];

export default function HowItWorksSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Section headline
            gsap.from(".hiw-headline", {
                opacity: 0, y: 30,
                duration: 0.8, ease: "power3.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 85%",
                    toggleActions: "play none none none",
                }
            });

            // Step cards stagger
            gsap.from(".step-card", {
                opacity: 0, y: 50, scale: 0.95,
                stagger: 0.12,
                duration: 0.8, ease: "power3.out",
                scrollTrigger: {
                    trigger: ".steps-grid",
                    start: "top 88%",
                    toggleActions: "play none none none",
                }
            });

            // Connecting line draw
            gsap.from(".hiw-line", {
                scaleX: 0,
                transformOrigin: "left",
                duration: 1.2, ease: "power3.inOut",
                scrollTrigger: {
                    trigger: ".steps-grid",
                    start: "top 85%",
                    toggleActions: "play none none none",
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-28" style={{ borderTop: "1px solid var(--border)", background: "var(--bg-2)" }}>
            <div className="container-custom">
                <div className="text-center mb-16 hiw-headline">
                    <p className="section-eyebrow">How It Works</p>
                    <h2 className="section-headline">
                        Simple. Secure.<br />
                        <span className="gradient-word">Unstoppable.</span>
                    </h2>
                </div>

                <div className="steps-grid grid md:grid-cols-4 gap-5 relative">
                    {/* Connecting line */}
                    <div
                        className="hiw-line hidden md:block absolute top-[42px] left-[15%] right-[15%] h-px"
                        style={{ background: "linear-gradient(90deg, transparent, var(--accent), var(--accent-light), var(--accent), transparent)", opacity: 0.3 }}
                        aria-hidden="true"
                    />

                    {steps.map((step) => (
                        <div key={step.n} className="step-card relative">
                            <span className="step-number">{step.n}</span>
                            <div className="step-icon-wrap">
                                <step.icon className="w-5 h-5" />
                            </div>
                            <h3 className="step-title">{step.title}</h3>
                            <p className="step-desc">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
