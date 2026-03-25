"use client";

import Link from "next/link";

const FOOTER_LINKS = {
    "Platform": [
        { label: "Browse Jobs", href: "/jobs" },
        { label: "Post a Job", href: "/jobs/create" },
        { label: "How It Works", href: "#how-it-works" },
        { label: "Pricing", href: "#" },
    ],
    "Company": [
        { label: "About", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Press", href: "#" },
    ],
    "Support": [
        { label: "Help Center", href: "#" },
        { label: "Dispute Policy", href: "#" },
        { label: "Community", href: "#" },
        { label: "Contact", href: "#" },
    ],
    "Legal": [
        { label: "Terms of Service", href: "#" },
        { label: "Privacy Policy", href: "#" },
        { label: "Cookie Policy", href: "#" },
    ],
};

export default function LandingFooter() {
    return (
        <footer style={{ background: "#0A0F1E" }}>

            {/* Top accent line */}
            <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(29,191,115,0.30), rgba(99,102,241,0.20), transparent)" }} />

            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-14">

                {/* Top row */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 mb-12">

                    {/* Brand col */}
                    <div className="lg:w-60 flex-shrink-0">
                        <Link href="/" className="flex items-center gap-2.5 mb-5 group">
                            <div
                                className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                                style={{ background: "linear-gradient(135deg, #1DBF73 0%, #17a862 100%)", boxShadow: "0 2px 10px rgba(29,191,115,0.28)" }}
                            >
                                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                                    <path d="M3 8.5L6.5 12L13 4" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="font-bold text-white text-[17px] tracking-tight" style={{ letterSpacing: "-0.02em" }}>
                                FairWork
                            </span>
                        </Link>
                        <p className="text-[13px] text-white/40 leading-relaxed mb-5">
                            The first escrow-protected freelance marketplace on Polygon. Powered by smart contracts and AI.
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-white/25">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1DBF73] flex-shrink-0" />
                            Live on Polygon Amoy
                        </div>
                    </div>

                    {/* Links grid */}
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-8">
                        {Object.entries(FOOTER_LINKS).map(([category, links]) => (
                            <div key={category}>
                                <h4
                                    className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/30 mb-4"
                                >
                                    {category}
                                </h4>
                                <ul className="space-y-2.5">
                                    {links.map((link) => (
                                        <li key={link.label}>
                                            <Link
                                                href={link.href}
                                                className="text-[13px] text-white/50 hover:text-white/85 transition-colors duration-150"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom bar */}
                <div
                    className="pt-7 flex flex-col sm:flex-row items-center justify-between gap-4"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
                >
                    <p className="text-[11px] text-white/25">
                        © {new Date().getFullYear()} FairWork. All rights reserved.
                    </p>
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] text-white/20">Contract:</span>
                        <code className="text-[11px] font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded-md">
                            0xc7cd...77fb4
                        </code>
                    </div>
                </div>

            </div>
        </footer>
    );
}
