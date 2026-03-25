"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import ProfileMenu from "./ProfileMenu";
import WalletButton from "./WalletButton";

const navLinks = [
    { href: "/jobs",        label: "Browse Jobs" },
    { href: "/disputes",    label: "Disputes" },
    { href: "/dashboard",   label: "Dashboard" },
];

export default function Navbar() {
    const pathname = usePathname();
    const { isConnected } = useAccount();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`sticky top-0 z-50 bg-[#0a0f1e]/80 backdrop-blur-xl transition-all duration-200 ${
                scrolled ? "border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]" : "border-b border-transparent"
            }`}
        >
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
                    <div
                        className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                        style={{ background: "linear-gradient(135deg, #1DBF73 0%, #17a862 100%)", boxShadow: "0 2px 8px rgba(29,191,115,0.30)" }}
                    >
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8.5L6.5 12L13 4" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className="font-bold text-white text-[17px] tracking-tight transition-colors duration-300">FairWork</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                                pathname === link.href || pathname.startsWith(link.href + "/")
                                    ? "text-[#1DBF73] bg-white/10"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-3">
                    <div className="hidden md:block">
                        {isConnected ? (
                            <ProfileMenu />
                        ) : (
                            <WalletButton />
                        )}
                    </div>
                    <Link
                        href="/jobs/create"
                        className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1DBF73] hover:bg-[#19A463] text-black text-sm font-bold transition-all duration-150 hover:-translate-y-px flex-shrink-0 shadow-[0_2px_8px_rgba(29,191,115,0.28)]"
                    >
                        Post a Job
                    </Link>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-white/60 hover:bg-white/10 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-[#0a0f1e]/95 backdrop-blur-xl border-t border-white/10">
                    <div className="max-w-[1600px] mx-auto px-4 py-3 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                    pathname === link.href
                                        ? "text-[#1DBF73] bg-white/10"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                            <Link href="/jobs/create" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1DBF73] hover:bg-[#19A463] text-black text-sm font-bold transition-all duration-150 justify-center">
                                Post a Job
                            </Link>
                            <div className="flex justify-center mt-2">
                                <WalletButton />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
