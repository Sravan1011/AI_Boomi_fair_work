"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import {
    Search, Star,
    ArrowRight, Briefcase, Zap, Lock, Clock,
    CheckCircle2, DollarSign, Grid3X3, Shield
} from "lucide-react";
import { useGSAP } from "@/hooks/useGSAP";

// ─── Category SVG Icons ────────────────────────────────────────────────────────
const WebDevIcon = () => (
    <svg width="40" height="40" viewBox="0 0 44 44" fill="none">
        <rect x="4" y="8" width="36" height="24" rx="3" stroke="#1DBF73" strokeWidth="1.8" />
        <path d="M4 14h36" stroke="#1DBF73" strokeWidth="1.8" />
        <circle cx="9" cy="11" r="1.2" fill="#1DBF73" /><circle cx="13.5" cy="11" r="1.2" fill="#19A463" /><circle cx="18" cy="11" r="1.2" fill="#34D399" />
        <path d="M14 20l-4 4 4 4M20 20l4 4-4 4M16 28l2.5-8" stroke="#19A463" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 36h8M22 32v4" stroke="#1DBF73" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);
const AIIcon = () => (
    <svg width="40" height="40" viewBox="0 0 44 44" fill="none">
        <circle cx="22" cy="22" r="7" stroke="#1DBF73" strokeWidth="1.8" />
        <circle cx="22" cy="22" r="2.5" fill="#1DBF73" />
        <circle cx="22" cy="8" r="2.5" stroke="#34D399" strokeWidth="1.6" /><circle cx="22" cy="36" r="2.5" stroke="#34D399" strokeWidth="1.6" />
        <circle cx="8" cy="22" r="2.5" stroke="#34D399" strokeWidth="1.6" /><circle cx="36" cy="22" r="2.5" stroke="#34D399" strokeWidth="1.6" />
        <circle cx="11.5" cy="11.5" r="2" stroke="#19A463" strokeWidth="1.4" /><circle cx="32.5" cy="11.5" r="2" stroke="#19A463" strokeWidth="1.4" />
        <line x1="22" y1="15" x2="22" y2="10.5" stroke="#34D399" strokeWidth="1.4" />
        <line x1="22" y1="29" x2="22" y2="33.5" stroke="#34D399" strokeWidth="1.4" />
        <line x1="15" y1="22" x2="10.5" y2="22" stroke="#34D399" strokeWidth="1.4" />
        <line x1="29" y1="22" x2="33.5" y2="22" stroke="#34D399" strokeWidth="1.4" />
    </svg>
);
const DesignIcon = () => (
    <svg width="40" height="40" viewBox="0 0 44 44" fill="none">
        <path d="M8 36l6-6 18-18 6 6-18 18-6-6z" stroke="#1DBF73" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M26 14l4 4" stroke="#34D399" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M8 36l-3 3 6-.5L8 36z" fill="#19A463" stroke="#19A463" strokeWidth="1" strokeLinejoin="round" />
        <circle cx="32" cy="10" r="4" stroke="#1DBF73" strokeWidth="1.8" />
    </svg>
);
const MarketingIcon = () => (
    <svg width="40" height="40" viewBox="0 0 44 44" fill="none">
        <path d="M8 30V20l10-8 16-6v28l-16-6-10-8z" stroke="#1DBF73" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M18 22h-4M14 22v8l4-2v-6" stroke="#1DBF73" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M37 16l3-3M37 28l3 3M40 22h-3" stroke="#19A463" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);

const categories = [
    { name: "Web Development", sub: "dApps · Smart Contracts · APIs",    Icon: WebDevIcon,    accentClass: "from-[#E9F9F0] to-[#D1FAE5]",  borderClass: "border-[#1DBF73]/20", glowClass: "bg-[#1DBF73]/10" },
    { name: "AI Services",     sub: "Agents · Automation · ML Models",   Icon: AIIcon,        accentClass: "from-[#EEF2FF] to-[#E0E7FF]",  borderClass: "border-[#6366f1]/20", glowClass: "bg-[#6366f1]/10" },
    { name: "Graphic Design",  sub: "UI/UX · Branding · NFT Art",        Icon: DesignIcon,    accentClass: "from-[#FFF7ED] to-[#FED7AA]",  borderClass: "border-[#F59E0B]/20", glowClass: "bg-[#F59E0B]/10" },
    { name: "Digital Marketing",sub: "Web3 Growth · DAOs · Community",   Icon: MarketingIcon, accentClass: "from-[#FFF1F2] to-[#FFE4E6]",  borderClass: "border-[#F43F5E]/20", glowClass: "bg-[#F43F5E]/10" },
];

const features = [
    { icon: Grid3X3,     title: "Access top talent",    desc: "across 100+ categories" },
    { icon: CheckCircle2,title: "Easy matching",         desc: "with smart recommendations" },
    { icon: Clock,       title: "Quality work fast",    desc: "done quickly and on budget" },
    { icon: DollarSign,  title: "Only pay when happy",  desc: "with secure escrow" },
];

const stats = [
    { value: "2.5%",  label: "Platform Fee",            color: "text-[#1DBF73]" },
    { value: "$0",    label: "Hidden Charges",           color: "text-[#1DBF73]" },
    { value: "24h",   label: "Avg Dispute Resolution",   color: "text-[#F59E0B]" },
    { value: "100%",  label: "Transparent",              color: "text-[#1DBF73]" },
];

const testimonials = [
    {
        quote: "I delivered a full DeFi dashboard — $4,800 USDC hit my wallet the moment the client approved. No chasing invoices, no 20% cut. FairWork is the only platform where I actually feel protected.",
        author: "Sarah Chen", role: "Full-Stack Developer", initials: "SC",
        gradient: "from-[#1DBF73] to-[#19A463]",
        metric: "$4,800 USDC", metricLabel: "earned on first job", tag: "DeFi · Next.js",
    },
    {
        quote: "Client said the deliverable was 'incomplete' — it wasn't. I submitted my evidence, the AI analyzed both sides in minutes, and the jury resolved it in under 6 hours. First time I've won a dispute on any platform.",
        author: "Marcus Johnson", role: "UI/UX Designer", initials: "MJ",
        gradient: "from-[#0EA5E9] to-[#0284C7]",
        metric: "6 hrs", metricLabel: "dispute fully resolved", tag: "UI/UX · Figma",
    },
    {
        quote: "Audited three smart contracts through FairWork. Each job was escrowed upfront — I never worried about payment. The on-chain history also became part of my portfolio.",
        author: "Elena Rodriguez", role: "Smart Contract Auditor", initials: "ER",
        gradient: "from-[#8B5CF6] to-[#6D28D9]",
        metric: "3 audits", metricLabel: "all paid on-chain", tag: "Solidity · Security",
    },
];

export default function DashboardPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const trustedRef     = useRef<HTMLDivElement>(null);
    const cardsRef       = useRef<HTMLDivElement>(null);
    const testimonialsRef= useRef<HTMLDivElement>(null);
    const testimonialHeadRef = useRef<HTMLDivElement>(null);

    useGSAP((gsap) => {
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
    }, []);

    return (
        <div className="min-h-screen bg-backdrop text-text-primary">
            <Navbar />

            {/* ── Hero ──────────────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden">
                {/* Ambient blobs */}
                <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-accent-indigo/8 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-violet/6 rounded-full blur-[100px] pointer-events-none" />

                <div className="absolute inset-0 z-0">
                    <Image src="/images/hero.png" alt="Professionals collaborating" fill className="object-cover opacity-20" priority />
                    <div className="absolute inset-0 bg-gradient-to-r from-backdrop/95 via-backdrop/70 to-transparent" />
                </div>

                <div className="relative z-10 max-w-[1600px] mx-auto px-6 py-28 lg:py-40">
                    <div className="max-w-2xl">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-accent-indigo/10 border border-accent-indigo/25 rounded-full px-4 py-2 mb-6">
                            <span className="w-2 h-2 bg-accent-emerald rounded-full animate-pulse" />
                            <span className="text-text-primary/80 text-sm font-medium">Now on Polygon Network</span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6 leading-[1.1] font-heading">
                            Find the perfect{" "}
                            <span className="bg-gradient-to-r from-accent-indigo to-accent-violet bg-clip-text text-transparent">
                                freelance
                            </span>{" "}
                            services for your business
                        </h1>

                        <p className="text-lg text-text-muted mb-8 leading-relaxed">
                            Secure escrow payments. AI-powered dispute resolution. The fairest freelance platform on Web3.
                        </p>

                        {/* Search */}
                        <div className="flex items-center gap-3 bg-surface-elevated/80 border border-surface-border rounded-2xl p-2 max-w-xl mb-6 focus-within:border-accent-indigo/40 transition-colors backdrop-blur-sm">
                            <Search className="w-5 h-5 text-text-muted ml-3 shrink-0" />
                            <input
                                type="text"
                                placeholder='Try "Smart Contract Development"'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent text-text-primary placeholder:text-text-subtle text-sm outline-none"
                            />
                            <Link href="/jobs">
                                <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-indigo to-accent-violet text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-glow-sm">
                                    Search <ArrowRight className="w-4 h-4" />
                                </button>
                            </Link>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-text-subtle text-sm">Popular:</span>
                            {["Smart Contracts", "Web3 Apps", "AI Agents", "DeFi"].map((tag) => (
                                <Link key={tag} href="/jobs"
                                    className="px-4 py-1.5 bg-surface-elevated border border-surface-border rounded-full text-sm text-text-muted hover:text-text-primary hover:border-accent-indigo/30 transition-all">
                                    {tag}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-backdrop to-transparent z-10" />
            </section>

            {/* ── Stats Bar ──────────────────────────────────────────────────────── */}
            <section className="border-y border-surface-border py-8 bg-surface/50">
                <div className="max-w-[1600px] mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((stat) => (
                            <div key={stat.label}>
                                <div className={`text-3xl font-bold font-heading mb-1 tabular ${stat.color}`}>
                                    {stat.value}
                                </div>
                                <div className="text-text-muted text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Trusted Services ───────────────────────────────────────────────── */}
            <section className="py-20">
                <div className="max-w-[1600px] mx-auto px-6">
                    <div ref={trustedRef} className="mb-12">
                        <div className="inline-flex items-center gap-2 bg-accent-indigo/10 border border-accent-indigo/20 rounded-full px-4 py-1.5 mb-4">
                            <span className="w-1.5 h-1.5 bg-accent-indigo rounded-full" />
                            <span className="text-accent-indigo text-xs font-semibold tracking-widest uppercase">Services</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-text-primary font-heading">Trusted Services</h2>
                        <p className="text-text-muted mt-2 text-sm">Top categories on FairWork, secured by on-chain escrow.</p>
                    </div>

                    <div ref={cardsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                        {categories.map((cat) => (
                            <Link key={cat.name} href="/jobs">
                                <div className={`cat-card group relative rounded-2xl p-6 text-center overflow-hidden cursor-pointer transition-all duration-300 bg-gradient-to-br ${cat.accentClass} border ${cat.borderClass} hover:-translate-y-1 hover:shadow-glow-sm`}>
                                    {/* Glow orb */}
                                    <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-300 ${cat.glowClass}`} />

                                    {/* Icon */}
                                    <div className="relative flex items-center justify-center w-16 h-16 mx-auto mb-5 rounded-2xl bg-white border border-[#E4E5E7] group-hover:scale-105 transition-transform duration-300">
                                        <cat.Icon />
                                    </div>

                                    <h3 className="text-sm font-semibold text-text-primary mb-1.5">{cat.name}</h3>
                                    <p className="text-text-subtle text-xs leading-relaxed group-hover:text-text-muted transition-colors duration-200">{cat.sub}</p>

                                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                                        <ArrowRight className="w-3.5 h-3.5 text-accent-indigo" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Promo — Web3 Help ──────────────────────────────────────────────── */}
            <section className="max-w-[1600px] mx-auto px-6 pb-16">
                <div className="relative overflow-hidden rounded-3xl border border-accent-indigo/20 bg-gradient-to-r from-accent-indigo/15 via-accent-violet/8 to-transparent">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-indigo/8 to-transparent" />
                    <div className="absolute top-0 left-0 w-48 h-48 bg-accent-indigo/10 rounded-full blur-3xl" />
                    <div className="relative grid lg:grid-cols-2 gap-8 items-center p-10 md:p-16">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 leading-tight font-heading">
                                Need help with<br />Web3 development?
                            </h2>
                            <p className="text-text-muted mb-6 text-lg">Get matched with the right expert to keep building and scaling your project</p>
                            <Link href="/jobs"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-accent-indigo/40 text-text-primary text-sm font-medium hover:bg-accent-indigo/10 transition-all">
                                Find an expert <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="relative h-52 lg:h-64">
                            <Image src="/images/promo-workspace.png" alt="Web3 Workspace" fill className="object-contain object-right" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Features ──────────────────────────────────────────────────────── */}
            <section className="py-16 border-t border-surface-border">
                <div className="max-w-[1600px] mx-auto px-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-12 font-heading">
                        Make it all happen with freelancers
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                        {features.map((feature, i) => (
                            <div key={i}>
                                <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center mb-4">
                                    <feature.icon className="w-5 h-5 text-accent-indigo" />
                                </div>
                                <h3 className="font-semibold text-text-primary mb-1 text-sm">{feature.title}</h3>
                                <p className="text-text-muted text-sm">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                    <Link href="/jobs">
                        <button className="px-8 py-3 bg-text-primary text-backdrop rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
                            Join now →
                        </button>
                    </Link>
                </div>
            </section>

            {/* ── Secure Escrow Promo ───────────────────────────────────────────── */}
            <section className="max-w-[1600px] mx-auto px-6 pb-16">
                <div className="relative overflow-hidden rounded-3xl border border-surface-border bg-surface">
                    <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-[0.03]" />
                    <div className="grid lg:grid-cols-2 gap-8 items-center p-10 md:p-16">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className="w-4 h-4 text-accent-emerald" />
                                <span className="text-sm font-medium text-text-muted">FairWork secure escrow.</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 leading-tight font-heading">
                                Secure payments<br />
                                <span className="bg-gradient-to-r from-accent-indigo to-accent-violet bg-clip-text text-transparent">in seconds</span>
                            </h2>
                            <p className="text-text-muted mb-6">Smart contract escrow. Funds release when you&apos;re happy.</p>
                            <button className="px-6 py-3 bg-accent-indigo text-white rounded-xl text-sm font-medium hover:bg-accent-indigo/90 transition-all shadow-glow-sm">
                                Try Secure Escrow
                            </button>
                        </div>
                        <div className="relative h-52 lg:h-64">
                            <Image src="/images/colorful-cans.png" alt="Secure Escrow" fill className="object-contain object-right" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── How It Works ──────────────────────────────────────────────────── */}
            <section className="py-20 border-t border-surface-border">
                <div className="max-w-[1600px] mx-auto px-6">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 font-heading">How It Works</h2>
                        <p className="text-text-muted max-w-2xl mx-auto">Simple, secure, and transparent from start to finish</p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-8 relative">
                        <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-px bg-gradient-to-r from-accent-indigo/30 via-accent-violet/30 to-accent-indigo/30" />
                        {[
                            { step: "01", title: "Post a Job",         desc: "Describe your project and set your budget", icon: Briefcase },
                            { step: "02", title: "Fund Escrow",        desc: "Deposit USDC into secure smart contract",   icon: Lock },
                            { step: "03", title: "Get Work Done",      desc: "Freelancer delivers, you review",           icon: Clock },
                            { step: "04", title: "Release Payment",    desc: "Approve and funds release instantly",       icon: Zap },
                        ].map((item) => (
                            <div key={item.step} className="text-center relative">
                                <div className="text-xs font-mono text-text-subtle mb-3">{item.step}</div>
                                <div className="relative z-10 w-14 h-14 bg-gradient-to-br from-accent-indigo to-accent-violet text-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-glow-sm">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-text-primary mb-2 font-heading text-sm tracking-wide">{item.title}</h3>
                                <p className="text-text-muted text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Testimonials ──────────────────────────────────────────────────── */}
            <section className="py-24 border-t border-surface-border">
                <div className="max-w-[1600px] mx-auto px-6">
                    <div ref={testimonialHeadRef} className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5 mb-5">
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                            <span className="text-amber-400 text-xs font-semibold tracking-widest uppercase">Real Stories</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-text-primary font-heading">What success on FairWork looks like</h2>
                        <p className="text-text-muted mt-3 text-sm max-w-lg mx-auto">
                            Real earnings. Real disputes resolved. Real on-chain proof.
                        </p>
                    </div>

                    <div ref={testimonialsRef} className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((t) => (
                            <div key={t.author}
                                className="t-card group relative rounded-2xl p-7 flex flex-col gap-5 transition-all duration-300 bg-surface-elevated/40 border border-surface-border hover:border-accent-indigo/30 hover:bg-accent-indigo/[0.03] hover:-translate-y-1">

                                {/* Top row */}
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-0.5">
                                        {[1,2,3,4,5].map((s) => (
                                            <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9F9F0] border border-[#1DBF73]/20">
                                        <span className="text-[#19A463] font-bold text-xs">{t.metric}</span>
                                        <span className="text-[#74767E] text-xs">{t.metricLabel}</span>
                                    </div>
                                </div>

                                {/* Quote */}
                                <div className="relative">
                                    <div className="absolute -top-1 -left-1 text-[64px] leading-none text-accent-indigo opacity-15 font-serif select-none">&quot;</div>
                                    <p className="text-text-muted text-sm leading-relaxed relative z-10 pt-4">{t.quote}</p>
                                </div>

                                {/* Tag */}
                                <div className="inline-flex self-start items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F7F7F7] border border-[#E4E5E7]">
                                    <span className="text-text-subtle text-xs font-mono">{t.tag}</span>
                                </div>

                                {/* Author */}
                                <div className="flex items-center gap-3 pt-1 border-t border-surface-border mt-auto">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 bg-gradient-to-br ${t.gradient}`}>
                                        {t.initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-text-primary text-sm">{t.author}</span>
                                            <span className="flex items-center gap-1 text-[10px] text-accent-emerald font-semibold">
                                                <CheckCircle2 className="w-3 h-3" /> Verified
                                            </span>
                                        </div>
                                        <div className="text-xs text-text-muted">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ───────────────────────────────────────────────────────────── */}
            <section className="py-20 border-t border-surface-border">
                <div className="max-w-[1600px] mx-auto px-6 text-center relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-accent-indigo/8 rounded-full blur-3xl pointer-events-none" />
                    <h2 className="relative text-3xl md:text-5xl font-bold text-text-primary mb-6 font-heading">Ready to work fairly?</h2>
                    <p className="text-text-muted mb-10 max-w-xl mx-auto">Connect your wallet and experience the future of freelancing. No signup. No fees until you get paid.</p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link href="/jobs/create"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-accent-indigo to-accent-violet text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-glow-sm">
                            Post a Job <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="/jobs"
                            className="inline-flex items-center gap-2 px-8 py-3.5 border border-surface-border text-text-muted rounded-xl text-sm font-medium hover:border-accent-indigo/30 hover:text-text-primary transition-all">
                            Browse Opportunities
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Footer ────────────────────────────────────────────────────────── */}
            <footer className="border-t border-surface-border py-16">
                <div className="max-w-[1600px] mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="md:col-span-1">
                            <Link href="/" className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-accent-indigo to-accent-violet rounded-lg flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-text-primary font-heading font-bold text-sm tracking-widest uppercase">FairWork</span>
                            </Link>
                            <p className="text-text-muted text-sm leading-relaxed">The fairest freelance platform. Built on Polygon, powered by AI.</p>
                        </div>
                        {[
                            { title: "Platform",   links: [{ label: "Browse Jobs", href: "/jobs" }, { label: "Post a Job", href: "/jobs/create" }, { label: "Dispute Center", href: "/disputes" }] },
                            { title: "Resources",  links: [{ label: "How It Works", href: "#" }, { label: "Smart Contracts", href: "#" }, { label: "Documentation", href: "#" }] },
                            { title: "Built With", links: [{ label: "Polygon Network", href: "https://polygon.technology" }, { label: "OpenAI", href: "https://openai.com" }, { label: "Supabase", href: "https://supabase.com" }] },
                        ].map((col) => (
                            <div key={col.title}>
                                <h4 className="text-text-primary font-semibold text-sm mb-4 font-heading tracking-wide">{col.title}</h4>
                                <div className="space-y-3">
                                    {col.links.map((l) => (
                                        <Link key={l.label} href={l.href} className="block text-sm text-text-muted hover:text-text-primary transition-colors">{l.label}</Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-surface-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-text-muted">© 2024 FairWork. All rights reserved.</p>
                        <div className="flex items-center gap-2 text-sm text-text-muted">
                            <span className="w-2 h-2 bg-accent-emerald rounded-full animate-pulse" />
                            Deployed on Polygon Amoy Testnet
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
