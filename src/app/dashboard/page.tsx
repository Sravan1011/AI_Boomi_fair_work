"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import {
    Search, Star,
    ArrowRight, Briefcase, Zap, Lock, Clock, Code, Palette,
    Megaphone, Cpu, CheckCircle2, DollarSign, Grid3X3
} from "lucide-react";

// ─── Category SVG Icons ───────────────────────────────────────────────────────

const WebDevIcon = () => (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="8" width="36" height="24" rx="3" stroke="#6366f1" strokeWidth="1.8" />
        <path d="M4 14h36" stroke="#6366f1" strokeWidth="1.8" />
        <circle cx="9" cy="11" r="1.2" fill="#6366f1" />
        <circle cx="13.5" cy="11" r="1.2" fill="#7c3aed" />
        <circle cx="18" cy="11" r="1.2" fill="#818cf8" />
        <path d="M14 20l-4 4 4 4" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 20l4 4-4 4" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 28l2.5-8" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M18 36h8" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M22 32v4" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);

const AIIcon = () => (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="22" cy="22" r="7" stroke="#6366f1" strokeWidth="1.8" />
        <circle cx="22" cy="22" r="2.5" fill="#6366f1" />
        <circle cx="22" cy="8" r="2.5" stroke="#818cf8" strokeWidth="1.6" />
        <circle cx="22" cy="36" r="2.5" stroke="#818cf8" strokeWidth="1.6" />
        <circle cx="8" cy="22" r="2.5" stroke="#818cf8" strokeWidth="1.6" />
        <circle cx="36" cy="22" r="2.5" stroke="#818cf8" strokeWidth="1.6" />
        <circle cx="11.5" cy="11.5" r="2" stroke="#7c3aed" strokeWidth="1.4" />
        <circle cx="32.5" cy="11.5" r="2" stroke="#7c3aed" strokeWidth="1.4" />
        <circle cx="11.5" cy="32.5" r="2" stroke="#7c3aed" strokeWidth="1.4" />
        <circle cx="32.5" cy="32.5" r="2" stroke="#7c3aed" strokeWidth="1.4" />
        <line x1="22" y1="15" x2="22" y2="10.5" stroke="#818cf8" strokeWidth="1.4" />
        <line x1="22" y1="29" x2="22" y2="33.5" stroke="#818cf8" strokeWidth="1.4" />
        <line x1="15" y1="22" x2="10.5" y2="22" stroke="#818cf8" strokeWidth="1.4" />
        <line x1="29" y1="22" x2="33.5" y2="22" stroke="#818cf8" strokeWidth="1.4" />
        <line x1="16.9" y1="16.9" x2="13.6" y2="13.6" stroke="#7c3aed" strokeWidth="1.3" />
        <line x1="27.1" y1="16.9" x2="30.4" y2="13.6" stroke="#7c3aed" strokeWidth="1.3" />
        <line x1="16.9" y1="27.1" x2="13.6" y2="30.4" stroke="#7c3aed" strokeWidth="1.3" />
        <line x1="27.1" y1="27.1" x2="30.4" y2="30.4" stroke="#7c3aed" strokeWidth="1.3" />
    </svg>
);

const DesignIcon = () => (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 36l6-6 18-18 6 6-18 18-6-6z" stroke="#6366f1" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M26 14l4 4" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M8 36l-3 3 6-0.5L8 36z" fill="#7c3aed" stroke="#7c3aed" strokeWidth="1" strokeLinejoin="round" />
        <circle cx="32" cy="10" r="4" stroke="#6366f1" strokeWidth="1.8" />
        <path d="M32 7v2M32 11v2M29 10h2M33 10h2" stroke="#818cf8" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M14 28l2 2" stroke="#818cf8" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);

const MarketingIcon = () => (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 30V20l10-8 16-6v28l-16-6-10-8z" stroke="#6366f1" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M18 22h-4" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M14 22v8l4-2v-6" stroke="#6366f1" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M34 18v8" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M37 16l3-3M37 28l3 3M40 22h-3" stroke="#7c3aed" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);

const categories = [
    { name: "Web Development", sub: "dApps · Smart Contracts · APIs", Icon: WebDevIcon, color: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.25)", glow: "rgba(99,102,241,0.15)" },
    { name: "AI Services", sub: "Agents · Automation · ML Models", Icon: AIIcon, color: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.25)", glow: "rgba(124,58,237,0.15)" },
    { name: "Graphic Design", sub: "UI/UX · Branding · NFT Art", Icon: DesignIcon, color: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.22)", glow: "rgba(129,140,248,0.12)" },
    { name: "Digital Marketing", sub: "Web3 Growth · DAOs · Community", Icon: MarketingIcon, color: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.2)", glow: "rgba(99,102,241,0.1)" },
];

const features = [
    { icon: Grid3X3, title: "Access top talent", description: "across 100+ categories" },
    { icon: CheckCircle2, title: "Easy matching", description: "with smart recommendations" },
    { icon: Clock, title: "Quality work fast", description: "done quickly and on budget" },
    { icon: DollarSign, title: "Only pay when happy", description: "with secure escrow" },
];

const stats = [
    { value: "2.5%", label: "Platform Fee" },
    { value: "$0", label: "Hidden Charges" },
    { value: "24h", label: "Avg Dispute Resolution" },
    { value: "100%", label: "Transparent" },
];

const testimonials = [
    {
        quote: "I delivered a full DeFi dashboard — $4,800 USDC hit my wallet the moment the client approved. No chasing invoices, no 20% cut. FairWork is the only platform where I actually feel protected.",
        author: "Sarah Chen",
        role: "Full-Stack Developer",
        initials: "SC",
        gradient: "linear-gradient(135deg, #6366f1, #818cf8)",
        metric: "$4,800 USDC",
        metricLabel: "earned on first job",
        tag: "DeFi · Next.js",
        verified: true,
    },
    {
        quote: "Client said the deliverable was 'incomplete' — it wasn't. I submitted my evidence, the AI analyzed both sides in minutes, and the jury resolved it in under 6 hours. First time I've won a dispute on any platform.",
        author: "Marcus Johnson",
        role: "UI/UX Designer",
        initials: "MJ",
        gradient: "linear-gradient(135deg, #7c3aed, #6366f1)",
        metric: "6 hrs",
        metricLabel: "dispute fully resolved",
        tag: "UI/UX · Figma",
        verified: true,
    },
    {
        quote: "Audited three smart contracts through FairWork. Each job was escrowed upfront — I never worried about payment. The on-chain history also became part of my portfolio. Other platforms can't offer that.",
        author: "Elena Rodriguez",
        role: "Smart Contract Auditor",
        initials: "ER",
        gradient: "linear-gradient(135deg, #4f46e5, #7c3aed)",
        metric: "3 audits",
        metricLabel: "all paid on-chain",
        tag: "Solidity · Security",
        verified: true,
    },
];

export default function HomePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const trustedRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);
    const testimonialsRef = useRef<HTMLDivElement>(null);
    const testimonialHeadRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let cleanup: (() => void) | undefined;
        import("gsap").then(({ gsap }) =>
            import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
                gsap.registerPlugin(ScrollTrigger);
                const ctx = gsap.context(() => {
                    const st = { once: true, clearProps: "all" };

                    if (trustedRef.current)
                        gsap.from(trustedRef.current, { y: 20, opacity: 0, duration: 0.7, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: trustedRef.current, start: "top 95%", ...st } });

                    if (cardsRef.current) {
                        const cards = cardsRef.current.querySelectorAll(".cat-card");
                        gsap.from(cards, { y: 36, opacity: 0, scale: 0.93, stagger: 0.1, duration: 0.6, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: cardsRef.current, start: "top 95%", ...st } });
                    }

                    if (testimonialHeadRef.current)
                        gsap.from(testimonialHeadRef.current, { y: 24, opacity: 0, duration: 0.7, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: testimonialHeadRef.current, start: "top 95%", ...st } });

                    if (testimonialsRef.current) {
                        const tcards = testimonialsRef.current.querySelectorAll(".t-card");
                        gsap.from(tcards, { y: 40, opacity: 0, scale: 0.95, stagger: 0.14, duration: 0.65, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: testimonialsRef.current, start: "top 95%", ...st } });
                    }
                });
                cleanup = () => ctx.revert();
            })
        );
        return () => cleanup?.();
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] text-[#f0f0f5]">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image src="/images/hero.png" alt="Professionals collaborating" fill className="object-cover opacity-30" priority />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/95 via-[#050505]/70 to-transparent" />
                </div>
                <div className="relative z-10 max-w-screen-xl mx-auto px-6 py-28 lg:py-40">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-full px-4 py-2 mb-6">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-[#f0f0f5]/80 text-sm font-medium">Now on Polygon Network</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-[#f0f0f5] mb-6 leading-[1.1]">
                            Find the perfect{" "}
                            <span className="bg-gradient-to-r from-[#6366f1] to-[#7c3aed] bg-clip-text text-transparent">
                                freelance
                            </span>{" "}
                            services for your business
                        </h1>
                        <p className="text-lg text-[#8888a0] mb-8 leading-relaxed">
                            Secure escrow payments. AI-powered dispute resolution. The fairest freelance platform on Web3.
                        </p>
                        {/* Search Bar */}
                        <div className="flex items-center gap-3 bg-[#111118] border border-[#1a1a24] rounded-2xl p-2 max-w-xl mb-6 focus-within:border-[#6366f1]/40 transition-colors">
                            <Search className="w-5 h-5 text-[#8888a0] ml-3" />
                            <input
                                type="text"
                                placeholder='Try "Smart Contract Development"'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent text-[#f0f0f5] placeholder:text-[#8888a0] text-sm outline-none"
                            />
                            <Link href="/jobs">
                                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#6366f1] text-white rounded-xl text-sm font-medium hover:bg-[#5254cc] transition-colors">
                                    Search <ArrowRight className="w-4 h-4" />
                                </button>
                            </Link>
                        </div>
                        {/* Popular Tags */}
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-[#8888a0] text-sm">Popular:</span>
                            {["Smart Contracts", "Web3 Apps", "AI Agents", "DeFi"].map((tag) => (
                                <Link key={tag} href="/jobs" className="px-4 py-1.5 bg-[#111118] border border-[#1a1a24] rounded-full text-sm text-[#8888a0] hover:text-[#f0f0f5] hover:border-[#6366f1]/30 transition-all">
                                    {tag}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#050505] to-transparent z-10" />
            </section>

            {/* Stats Bar */}
            <section className="border-y border-[#1a1a24] py-8">
                <div className="max-w-screen-xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((stat) => (
                            <div key={stat.label}>
                                <div className="text-3xl font-light bg-gradient-to-r from-[#6366f1] to-[#7c3aed] bg-clip-text text-transparent mb-1">{stat.value}</div>
                                <div className="text-[#8888a0] text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trusted Services */}
            <section className="py-20">
                <div className="max-w-screen-xl mx-auto px-6">
                    <div ref={trustedRef} className="mb-12">
                        <div className="inline-flex items-center gap-2 bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-full px-4 py-1.5 mb-4">
                            <span className="w-1.5 h-1.5 bg-[#6366f1] rounded-full" />
                            <span className="text-[#818cf8] text-xs font-semibold tracking-widest uppercase">Services</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-light text-[#f0f0f5]">Trusted Services</h2>
                        <p className="text-[#8888a0] mt-2 text-sm">Top categories on FairWork, secured by on-chain escrow.</p>
                    </div>

                    <div ref={cardsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                        {categories.map((category) => (
                            <Link key={category.name} href="/jobs">
                                <div
                                    className="cat-card group relative rounded-2xl p-6 text-center overflow-hidden cursor-pointer transition-all duration-300"
                                    style={{
                                        background: category.color,
                                        border: `1px solid ${category.border}`,
                                    }}
                                    onMouseEnter={(e) => {
                                        const el = e.currentTarget;
                                        el.style.transform = "translateY(-4px)";
                                        el.style.boxShadow = `0 16px 40px ${category.glow}`;
                                        el.style.borderColor = category.border.replace("0.25", "0.5");
                                    }}
                                    onMouseLeave={(e) => {
                                        const el = e.currentTarget;
                                        el.style.transform = "translateY(0)";
                                        el.style.boxShadow = "none";
                                        el.style.borderColor = category.border;
                                    }}
                                >
                                    {/* Glow orb */}
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full blur-2xl opacity-40 transition-opacity duration-300 group-hover:opacity-70"
                                        style={{ background: `radial-gradient(circle, ${category.border}, transparent)` }} />

                                    {/* Icon */}
                                    <div className="relative flex items-center justify-center w-16 h-16 mx-auto mb-5 rounded-2xl transition-transform duration-300 group-hover:scale-110"
                                        style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${category.border}` }}>
                                        <category.Icon />
                                    </div>

                                    <h3 className="text-sm font-semibold text-[#f0f0f5] mb-1.5 transition-colors duration-200 group-hover:text-white">
                                        {category.name}
                                    </h3>
                                    <p className="text-[#555] text-xs leading-relaxed group-hover:text-[#8888a0] transition-colors duration-200">
                                        {category.sub}
                                    </p>

                                    {/* Arrow */}
                                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                                        <ArrowRight className="w-3.5 h-3.5 text-[#818cf8]" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Promo — Web3 Help */}
            <section className="max-w-screen-xl mx-auto px-6 pb-16">
                <div className="relative overflow-hidden rounded-3xl border border-[#1a1a24] bg-gradient-to-r from-[#6366f1]/20 via-[#7c3aed]/10 to-[#050505]">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/10 to-transparent" />
                    <div className="relative grid lg:grid-cols-2 gap-8 items-center p-10 md:p-16">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-light text-[#f0f0f5] mb-4 leading-tight">
                                Need help with<br />Web3 development?
                            </h2>
                            <p className="text-[#8888a0] mb-6 text-lg">Get matched with the right expert to keep building and scaling your project</p>
                            <Link href="/jobs">
                                <button className="px-6 py-3 rounded-xl border border-[#6366f1]/40 text-[#f0f0f5] text-sm font-medium hover:bg-[#6366f1]/10 transition-all">Find an expert →</button>
                            </Link>
                        </div>
                        <div className="relative h-52 lg:h-64">
                            <Image src="/images/promo-workspace.png" alt="Web3 Workspace" fill className="object-contain object-right" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 border-t border-[#1a1a24]">
                <div className="max-w-screen-xl mx-auto px-6">
                    <h2 className="text-2xl md:text-3xl font-light text-[#f0f0f5] mb-12">Make it all happen with freelancers</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                        {features.map((feature, i) => (
                            <div key={i}>
                                <div className="w-12 h-12 rounded-xl bg-[#111118] border border-[#1a1a24] flex items-center justify-center mb-4">
                                    <feature.icon className="w-5 h-5 text-[#6366f1]" />
                                </div>
                                <h3 className="font-medium text-[#f0f0f5] mb-1 text-sm">{feature.title}</h3>
                                <p className="text-[#8888a0] text-sm">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                    <Link href="/jobs">
                        <button className="px-8 py-3 bg-[#f0f0f5] text-[#050505] rounded-xl text-sm font-medium hover:bg-white transition-colors">
                            Join now →
                        </button>
                    </Link>
                </div>
            </section>

            {/* Secure Escrow Promo */}
            <section className="max-w-screen-xl mx-auto px-6 pb-16">
                <div className="relative overflow-hidden rounded-3xl border border-[#1a1a24] bg-[#0a0a0f]">
                    <div className="grid lg:grid-cols-2 gap-8 items-center p-10 md:p-16">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-lg font-medium text-[#f0f0f5]">FairWork</span>
                                <span className="text-lg font-light text-[#8888a0]">secure escrow.</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-light text-[#f0f0f5] mb-4 leading-tight">
                                Secure payments<br />
                                <span className="bg-gradient-to-r from-[#6366f1] to-[#7c3aed] bg-clip-text text-transparent">in seconds</span>
                            </h2>
                            <p className="text-[#8888a0] mb-6">Smart contract escrow. Funds release when you&apos;re happy.</p>
                            <button className="px-6 py-3 bg-[#6366f1] text-white rounded-xl text-sm font-medium hover:bg-[#5254cc] transition-all shadow-lg shadow-indigo-500/20">
                                Try Secure Escrow
                            </button>
                        </div>
                        <div className="relative h-52 lg:h-64">
                            <Image src="/images/colorful-cans.png" alt="Secure Escrow" fill className="object-contain object-right" />
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 border-t border-[#1a1a24]">
                <div className="max-w-screen-xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-light text-[#f0f0f5] mb-4">How It Works</h2>
                        <p className="text-[#8888a0] max-w-2xl mx-auto">Simple, secure, and transparent from start to finish</p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-8 relative">
                        <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-px bg-gradient-to-r from-[#6366f1]/30 via-[#7c3aed]/30 to-[#6366f1]/30" />
                        {[
                            { step: "1", title: "Post a Job", desc: "Describe your project and set your budget", icon: Briefcase },
                            { step: "2", title: "Fund Escrow", desc: "Deposit USDC into secure smart contract", icon: Lock },
                            { step: "3", title: "Get Work Done", desc: "Freelancer delivers, you review", icon: Clock },
                            { step: "4", title: "Release Payment", desc: "Approve and funds release instantly", icon: Zap },
                        ].map((item) => (
                            <div key={item.step} className="text-center relative">
                                <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-[#6366f1] to-[#7c3aed] text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20">
                                    <item.icon className="w-7 h-7" />
                                </div>
                                <h3 className="font-medium text-[#f0f0f5] mb-2">{item.title}</h3>
                                <p className="text-[#8888a0] text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 border-t border-[#1a1a24]">
                <div className="max-w-screen-xl mx-auto px-6">

                    {/* Header */}
                    <div ref={testimonialHeadRef} className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5 mb-5">
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                            <span className="text-amber-400 text-xs font-semibold tracking-widest uppercase">Real Stories</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-light text-[#f0f0f5]">What success on FairWork looks like</h2>
                        <p className="text-[#8888a0] mt-3 text-sm max-w-lg mx-auto">
                            From first payment to dispute resolution — real outcomes from real freelancers.
                        </p>
                    </div>

                    {/* Cards */}
                    <div ref={testimonialsRef} className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((t) => (
                            <div
                                key={t.author}
                                className="t-card group relative rounded-2xl p-7 flex flex-col gap-5 transition-all duration-300"
                                style={{
                                    background: "rgba(255,255,255,0.02)",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                }}
                                onMouseEnter={(e) => {
                                    const el = e.currentTarget;
                                    el.style.borderColor = "rgba(99,102,241,0.3)";
                                    el.style.background = "rgba(99,102,241,0.04)";
                                    el.style.transform = "translateY(-3px)";
                                }}
                                onMouseLeave={(e) => {
                                    const el = e.currentTarget;
                                    el.style.borderColor = "rgba(255,255,255,0.07)";
                                    el.style.background = "rgba(255,255,255,0.02)";
                                    el.style.transform = "translateY(0)";
                                }}
                            >
                                {/* Top row: stars + metric badge */}
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-0.5">
                                        {[1,2,3,4,5].map((s) => (
                                            <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                                        style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.22)" }}>
                                        <span className="text-[#818cf8] font-bold text-xs">{t.metric}</span>
                                        <span className="text-[#555] text-xs">{t.metricLabel}</span>
                                    </div>
                                </div>

                                {/* Quote */}
                                <div className="relative">
                                    {/* Decorative quote mark */}
                                    <div className="absolute -top-1 -left-1 text-[64px] leading-none text-[#6366f1] opacity-15 font-serif select-none">"</div>
                                    <p className="text-[#a0a0b8] text-sm leading-relaxed relative z-10 pt-4">
                                        {t.quote}
                                    </p>
                                </div>

                                {/* Tag */}
                                <div className="inline-flex self-start items-center gap-1.5 px-2.5 py-1 rounded-lg"
                                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                                    <span className="text-[#555] text-xs font-mono">{t.tag}</span>
                                </div>

                                {/* Author */}
                                <div className="flex items-center gap-3 pt-1 border-t border-[#1a1a24] mt-auto">
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                        style={{ background: t.gradient }}>
                                        {t.initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-[#f0f0f5] text-sm">{t.author}</span>
                                            {t.verified && (
                                                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                                                    <CheckCircle2 className="w-3 h-3" /> Verified
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-[#8888a0]">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 border-t border-[#1a1a24]">
                <div className="max-w-screen-xl mx-auto px-6 text-center relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-[#6366f1]/10 rounded-full blur-3xl pointer-events-none" />
                    <h2 className="relative text-3xl md:text-5xl font-light text-[#f0f0f5] mb-6">Ready to work fairly?</h2>
                    <p className="text-[#8888a0] mb-10 max-w-xl mx-auto">Connect your wallet and experience the future of freelancing. No signup. No fees until you get paid.</p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link href="/jobs/create" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#6366f1] text-white rounded-xl text-sm font-medium hover:bg-[#5254cc] transition-all shadow-lg shadow-indigo-500/20">
                            Post a Job <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="/jobs" className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#1a1a24] text-[#8888a0] rounded-xl text-sm font-medium hover:border-[#6366f1]/30 hover:text-[#f0f0f5] transition-all">
                            Browse Opportunities
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-[#1a1a24] py-16">
                <div className="max-w-screen-xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="md:col-span-1">
                            <Link href="/" className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-[#6366f1] to-[#7c3aed] rounded-lg flex items-center justify-center">
                                    <Briefcase className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-[#f0f0f5] font-medium">FairWork</span>
                            </Link>
                            <p className="text-[#8888a0] text-sm leading-relaxed">The fairest freelance platform. Built on Polygon, powered by AI.</p>
                        </div>
                        {[
                            { title: "Platform", links: [{ label: "Browse Jobs", href: "/jobs" }, { label: "Post a Job", href: "/jobs/create" }, { label: "Dispute Center", href: "/disputes" }] },
                            { title: "Resources", links: [{ label: "How It Works", href: "#" }, { label: "Smart Contracts", href: "#" }, { label: "Documentation", href: "#" }] },
                            { title: "Built With", links: [{ label: "Polygon Network", href: "https://polygon.technology" }, { label: "OpenAI", href: "https://openai.com" }, { label: "Supabase", href: "https://supabase.com" }] },
                        ].map((col) => (
                            <div key={col.title}>
                                <h4 className="text-[#f0f0f5] font-medium text-sm mb-4">{col.title}</h4>
                                <div className="space-y-3">
                                    {col.links.map((l) => (
                                        <Link key={l.label} href={l.href} className="block text-sm text-[#8888a0] hover:text-[#f0f0f5] transition-colors">{l.label}</Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-[#1a1a24] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-[#8888a0]">© 2024 FairWork. All rights reserved.</p>
                        <div className="flex items-center gap-2 text-sm text-[#8888a0]">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            Deployed on Polygon Amoy Testnet
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
