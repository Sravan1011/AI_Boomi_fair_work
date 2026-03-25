"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
    { label: "Browse Jobs", href: "/jobs" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Why FairWork", href: "#why-fairwork" },
];

const SCROLL_CATEGORIES = [
    "Smart Contracts", "DApp Development", "Web3 Design",
    "DeFi Protocols", "NFT Projects", "AI Agents", "Auditing",
];

export default function LandingNavbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchVal, setSearchVal] = useState("");

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 72);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
                scrolled
                    ? "bg-[#0a0f1e]/80 backdrop-blur-xl border-b border-white/10"
                    : "bg-transparent border-b border-transparent"
            }`}
        >
            {/* ── Main bar ── */}
            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between gap-4">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
                        <div
                            className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                            style={{ background: "linear-gradient(135deg, #1DBF73 0%, #17a862 100%)", boxShadow: "0 2px 8px rgba(29,191,115,0.30)" }}
                        >
                            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                                <path d="M3 8.5L6.5 12L13 4" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="font-bold text-[17px] tracking-tight transition-colors duration-300 text-white">
                            FairWork
                        </span>
                    </Link>

                    {/* Scroll-activated compact search */}
                    <AnimatePresence>
                        {scrolled && (
                            <motion.div
                                className="hidden md:flex flex-1 max-w-xs mx-4"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 200, damping: 22 }}
                            >
                                <div className="flex items-center w-full rounded-full border border-white/10 bg-white/5 overflow-hidden hover:border-[#1DBF73]/50 transition-colors duration-200">
                                    <Search className="w-3.5 h-3.5 text-white/50 ml-3.5 flex-shrink-0" />
                                    <input
                                        type="text"
                                        value={searchVal}
                                        onChange={(e) => setSearchVal(e.target.value)}
                                        placeholder="Search services..."
                                        className="flex-1 text-white text-sm placeholder:text-white/40 outline-none bg-transparent px-3 py-2.5 min-w-0"
                                        aria-label="Search services"
                                    />
                                    <Link
                                        href={`/jobs${searchVal ? `?q=${encodeURIComponent(searchVal)}` : ""}`}
                                        className="m-1 px-4 py-1.5 rounded-full bg-[#1DBF73] hover:bg-[#19A463] text-black text-xs font-bold transition-colors duration-150 flex-shrink-0"
                                    >
                                        Go
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Desktop nav links — only when at top */}
                    <nav
                        className={`hidden md:flex items-center gap-1 transition-all duration-300 ${
                            scrolled ? "opacity-0 pointer-events-none absolute" : "opacity-100"
                        }`}
                    >
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="relative px-4 py-2 rounded-lg text-[13px] font-medium text-white/75 hover:text-white transition-colors duration-150 group"
                            >
                                {link.label}
                                <span className="absolute bottom-1 left-4 right-4 h-px bg-white/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full" />
                            </Link>
                        ))}
                    </nav>

                    {/* Right actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                            href="/register"
                            className="hidden sm:inline-flex items-center px-3.5 py-2 text-[13px] font-semibold rounded-lg transition-all duration-200 text-white/80 hover:text-white hover:bg-white/10"
                        >
                            Sign In
                        </Link>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                            <Link
                                href="/register"
                                className="inline-flex items-center px-4 py-2 rounded-full text-[13px] font-bold text-black transition-all duration-200"
                                style={{
                                    background: "linear-gradient(135deg, #1DBF73 0%, #17a862 100%)",
                                    boxShadow: "0 2px 8px rgba(29,191,115,0.28)",
                                }}
                            >
                                Join FairWork
                            </Link>
                        </motion.div>
                        <button
                            className={`md:hidden p-2 rounded-lg transition-colors ${
                                scrolled ? "text-[#6B7280] hover:bg-[#F3F4F6]" : "text-white hover:bg-white/10"
                            }`}
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Scroll-activated category strip ── */}
            <AnimatePresence>
                {scrolled && (
                    <motion.div
                        className="hidden md:block border-t border-white/10 bg-[#0a0f1e]/90 backdrop-blur-xl"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                    >
                        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center gap-0.5 py-2 overflow-x-auto scrollbar-hide">
                                {SCROLL_CATEGORIES.map((cat, i) => (
                                    <motion.div
                                        key={cat}
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.035, type: "spring", stiffness: 150, damping: 22 }}
                                    >
                                        <Link
                                            href={`/jobs?category=${encodeURIComponent(cat)}`}
                                            className="whitespace-nowrap px-3 py-1.5 text-[12.5px] font-medium text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-150 flex-shrink-0"
                                        >
                                            {cat}
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Mobile drawer ── */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        className="md:hidden bg-[#0a0f1e]/95 backdrop-blur-xl border-t border-white/10 px-4 py-3 space-y-0.5"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ type: "spring", stiffness: 220, damping: 28 }}
                    >
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="block px-4 py-2.5 rounded-xl text-[13.5px] font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="pt-2 border-t border-white/10 flex flex-col gap-2 mt-1">
                            <Link
                                href="/register"
                                className="px-4 py-2.5 rounded-xl text-[13.5px] font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/register"
                                className="inline-flex justify-center items-center px-4 py-2.5 rounded-full text-[13.5px] font-bold text-black"
                                style={{ background: "linear-gradient(135deg, #1DBF73 0%, #17a862 100%)" }}
                            >
                                Join FairWork
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
