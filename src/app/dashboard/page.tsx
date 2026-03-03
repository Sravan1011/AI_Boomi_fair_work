"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import {
    Search, Star,
    ArrowRight, Briefcase, Zap, Lock, Clock, Code, Palette,
    Megaphone, Cpu, CheckCircle2, DollarSign, Grid3X3
} from "lucide-react";

const categories = [
    { name: "Web Development", image: "/images/category-webdev.png", icon: Code },
    { name: "AI Services", image: "/images/category-ai.png", icon: Cpu },
    { name: "Graphic Design", image: "/images/category-design.png", icon: Palette },
    { name: "Digital Marketing", image: "/images/category-marketing.png", icon: Megaphone },
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
    { quote: "Finally, a platform that doesn't take 20% of my earnings. The escrow system gives me peace of mind.", author: "Sarah Chen", role: "Full-Stack Developer", avatar: "👩‍💻" },
    { quote: "The AI dispute resolution saved me weeks of back-and-forth. Fair and fast.", author: "Marcus Johnson", role: "UI/UX Designer", avatar: "👨‍🎨" },
    { quote: "Web3 freelancing done right. Lower fees, better protection, transparent process.", author: "Elena Rodriguez", role: "Smart Contract Auditor", avatar: "👩‍🔬" },
];

export default function HomePage() {
    const [searchQuery, setSearchQuery] = useState("");

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

            {/* Categories */}
            <section className="py-20">
                <div className="max-w-screen-xl mx-auto px-6">
                    <h2 className="text-2xl md:text-3xl font-light text-[#f0f0f5] mb-10">Trusted Services</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                        {categories.map((category) => (
                            <Link key={category.name} href="/jobs">
                                <div className="group rounded-2xl border border-[#1a1a24] bg-[#111118]/60 p-6 hover:border-[#6366f1]/30 hover:shadow-lg hover:shadow-[#6366f1]/5 transition-all duration-300 text-center">
                                    <div className="relative w-16 h-16 mx-auto mb-4">
                                        <Image src={category.image} alt={category.name} fill className="object-contain" />
                                    </div>
                                    <h3 className="text-sm font-medium text-[#f0f0f5] group-hover:text-[#6366f1] transition-colors">{category.name}</h3>
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
            <section className="py-20 border-t border-[#1a1a24]">
                <div className="max-w-screen-xl mx-auto px-6">
                    <h2 className="text-3xl md:text-4xl font-light text-[#f0f0f5] mb-12 text-center">What success on FairWork looks like</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((t) => (
                            <div key={t.author} className="rounded-2xl border border-[#1a1a24] bg-[#111118]/60 p-8 hover:border-[#6366f1]/20 transition-all">
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-[#8888a0] mb-6 leading-relaxed text-sm">&quot;{t.quote}&quot;</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#1a1a24] rounded-full flex items-center justify-center text-xl">{t.avatar}</div>
                                    <div>
                                        <div className="font-medium text-[#f0f0f5] text-sm">{t.author}</div>
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
