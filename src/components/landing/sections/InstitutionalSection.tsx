"use client";

import { useRef } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import BorderGlow from "@/components/landing/BorderGlow";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const GIGS = [
    {
        id: 1,
        title: "I will build a secure Solidity smart contract with audit",
        seller: "0xAlexW",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Alex&backgroundColor=1DBF73&fontFamily=Arial&fontSize=40",
        rating: 4.9,
        reviews: 312,
        price: 299,
        badge: "Top Rated",
        image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=240&fit=crop&q=80",
        tags: ["Solidity", "Audit"],
    },
    {
        id: 2,
        title: "I will design a full Web3 dApp UI with Figma + React",
        seller: "0xMariaD",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Maria&backgroundColor=7c3aed&fontFamily=Arial&fontSize=40",
        rating: 5.0,
        reviews: 187,
        price: 149,
        badge: "Pro",
        image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=240&fit=crop&q=80",
        tags: ["React", "UI/UX"],
    },
    {
        id: 3,
        title: "I will create a DeFi protocol integration for your platform",
        seller: "0xChrisK",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Chris&backgroundColor=f59e0b&fontFamily=Arial&fontSize=40",
        rating: 4.8,
        reviews: 94,
        price: 499,
        badge: "Expert",
        image: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400&h=240&fit=crop&q=80",
        tags: ["DeFi", "TypeScript"],
    },
    {
        id: 4,
        title: "I will launch your NFT collection with metadata and contract",
        seller: "0xSophieL",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Sophie&backgroundColor=ef4444&fontFamily=Arial&fontSize=40",
        rating: 4.7,
        reviews: 231,
        price: 399,
        badge: "Rising Talent",
        image: "https://images.unsplash.com/photo-1643101808200-0d159c1331f9?w=400&h=240&fit=crop&q=80",
        tags: ["NFT", "IPFS"],
    },
];

const BADGE_STYLES: Record<string, string> = {
    "Top Rated":    "bg-[#1DBF73]/20 text-[#1DBF73] border-[#1DBF73]/30",
    "Pro":          "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "Expert":       "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "Rising Talent":"bg-rose-500/20 text-rose-400 border-rose-500/30",
};

export default function InstitutionalSection() {
    const containerRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        gsap.from(".inst-header", {
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 80%",
            },
            y: 40,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });

        gsap.from(".inst-card", {
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 75%",
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "back.out(1.2)"
        });
    }, { scope: containerRef });

    return (
        <section ref={containerRef} className="py-24 relative z-10 backdrop-blur-[2px]">
            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="inst-header flex flex-col sm:flex-row items-end justify-between mb-16 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-[#1DBF73] shadow-[0_0_8px_#1DBF73]" />
                            <span className="text-white/80 text-xs font-semibold uppercase tracking-[0.2em]">Elite Talent</span>
                        </div>
                        <h2
                            className="font-bold text-white mb-3"
                            style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", letterSpacing: "-0.04em", lineHeight: 1.1 }}
                        >
                            Hire world-class<br/>Web3 developers
                        </h2>
                        <p className="text-[#A1A1AA] text-lg font-light tracking-wide">Verified on-chain talent, ready to build.</p>
                    </div>
                    <Link
                        href="/jobs"
                        className="inline-flex items-center justify-center gap-2 text-[15px] font-semibold px-8 py-3.5 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors duration-300 bg-white/5 backdrop-blur-md"
                    >
                        View all talent →
                    </Link>
                </div>

                {/* Gig cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {GIGS.map((gig) => (
                        <BorderGlow
                            key={gig.id}
                            className="inst-card group cursor-pointer transition-transform duration-300 hover:-translate-y-2 h-full"
                            borderRadius={24}
                            glowIntensity={0.9}
                            coneSpread={60}
                            backgroundColor="rgba(10, 10, 22, 0.85)"
                        >
                            <Link
                                href="/jobs"
                                className="group overflow-hidden flex flex-col h-full rounded-[24px]"
                            >
                                {/* Thumbnail */}
                                <div className="relative overflow-hidden aspect-[4/2.5] flex-shrink-0">
                                    <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-transparent transition-colors duration-500" />
                                    <img
                                        src={gig.image}
                                        alt={gig.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute bottom-4 left-4 z-20">
                                        <img src={gig.avatar} alt={gig.seller} className="w-10 h-10 rounded-full border-2 border-[#1E1E1E] shadow-[0_4px_12px_rgba(0,0,0,0.5)]" />
                                    </div>
                                </div>

                                {/* Card body */}
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[13px] font-medium text-white/60 font-mono tracking-wider">{gig.seller}</span>
                                        <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border tracking-wider ${BADGE_STYLES[gig.badge]}`}>
                                            {gig.badge}
                                        </span>
                                    </div>

                                    <p
                                        className="font-medium text-white leading-relaxed mb-5 line-clamp-2 flex-1 group-hover:text-white/80 transition-colors duration-300"
                                        style={{ fontSize: "16px" }}
                                    >
                                        {gig.title}
                                    </p>

                                    <div className="flex gap-2 mb-5 flex-wrap">
                                        {gig.tags.map((tag) => (
                                            <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/50 border border-white/10">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                        <div className="flex items-center gap-1.5">
                                            <Star className="w-4 h-4 fill-[#f59e0b] text-[#f59e0b]" />
                                            <span className="text-sm font-semibold text-white">{gig.rating}</span>
                                            <span className="text-xs text-white/40">({gig.reviews})</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] text-white/40 block uppercase tracking-widest mb-1">Starting at</span>
                                            <span className="text-lg font-bold text-white">
                                                ${gig.price} <span className="text-xs font-normal text-white/40">USDC</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </BorderGlow>
                    ))}
                </div>
            </div>
        </section>
    );
}
