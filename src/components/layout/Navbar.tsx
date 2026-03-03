"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const navLinks = [
    { href: "/jobs", label: "Browse Jobs" },
    { href: "/jobs/create", label: "Post Job" },
    { href: "/disputes", label: "Disputes" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`sticky top-0 z-50 transition-all duration-300 border-b ${scrolled
                    ? "bg-[#0a0a0f]/90 backdrop-blur-xl border-[#1a1a24]"
                    : "bg-[#0a0a0f]/70 backdrop-blur-md border-[#1a1a24]/50"
                }`}
        >
            <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#7c3aed] flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <span className="text-white font-bold text-sm">F</span>
                    </div>
                    <span className="text-[#f0f0f5] font-semibold text-base tracking-tight">
                        FairWork
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${pathname === link.href
                                    ? "text-[#6366f1] bg-[#6366f1]/10"
                                    : "text-[#8888a0] hover:text-[#f0f0f5] hover:bg-white/5"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Right: Wallet + CTA */}
                <div className="flex items-center gap-3">
                    <div className="hidden md:block">
                        <ConnectButton
                            showBalance={false}
                            accountStatus="avatar"
                            chainStatus="icon"
                        />
                    </div>
                    <Link
                        href="/jobs/create"
                        className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6366f1] text-white text-sm font-medium hover:bg-[#5254cc] transition-all shadow-lg shadow-indigo-500/20"
                    >
                        Post a Job
                    </Link>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-[#8888a0] hover:text-[#f0f0f5] hover:bg-white/5 transition-colors"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-[#0a0a0f] border-t border-[#1a1a24]">
                    <div className="max-w-screen-xl mx-auto px-6 py-4 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${pathname === link.href
                                        ? "text-[#6366f1] bg-[#6366f1]/10"
                                        : "text-[#8888a0] hover:text-[#f0f0f5] hover:bg-white/5"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="pt-3 border-t border-[#1a1a24]">
                            <ConnectButton />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
