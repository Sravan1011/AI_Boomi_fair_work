"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
    {
        quote: "Finally a platform that doesn't take 20% of my earnings. The escrow system gives me complete peace of mind.",
        author: "Sarah Chen",
        role: "Full-Stack Developer",
        rating: 5,
        avatar: "SC",
    },
    {
        quote: "The AI dispute resolution saved me weeks of back-and-forth. Fair, fast, and completely transparent.",
        author: "Marcus Johnson",
        role: "UI/UX Designer",
        rating: 5,
        avatar: "MJ",
    },
    {
        quote: "Web3 freelancing done right. Lower fees, better protection, transparent process. Nothing else comes close.",
        author: "Elena Rodriguez",
        role: "Smart Contract Auditor",
        rating: 5,
        avatar: "ER",
    },
];

export default function TestimonialsSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".testi-headline", {
                opacity: 0, y: 30,
                duration: 0.8, ease: "power3.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 85%",
                    toggleActions: "play none none none",
                }
            });

            gsap.from(".testimonial-card", {
                opacity: 0,
                y: 60,
                rotateX: 8,
                transformPerspective: 800,
                stagger: 0.15,
                duration: 0.9,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ".testimonials-grid",
                    start: "top 88%",
                    toggleActions: "play none none none",
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-28" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="container-custom">
                <div className="text-center mb-16 testi-headline">
                    <p className="section-eyebrow">Testimonials</p>
                    <h2 className="section-headline">
                        What builders say<br />
                        <span className="gradient-word">about FairWork.</span>
                    </h2>
                </div>

                <div className="testimonials-grid grid md:grid-cols-3 gap-6">
                    {testimonials.map((t) => (
                        <div key={t.author} className="testimonial-card">
                            <div className="flex gap-1 mb-5">
                                {Array.from({ length: t.rating }).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <div className="testimonial-quote">&ldquo;</div>
                            <p className="testimonial-text">{t.quote}</p>
                            <div className="flex items-center gap-3 mt-4">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                                    style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-light))" }}>
                                    {t.avatar}
                                </div>
                                <div>
                                    <div className="testimonial-author-name">{t.author}</div>
                                    <div className="testimonial-author-role">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
