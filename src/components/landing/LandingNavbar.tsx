"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#comparison", label: "Compare" },
    { href: "#architecture", label: "Protocol" },
];

export default function LandingNavbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-400 ${scrolled
                    ? "bg-backdrop/70 backdrop-blur-xl border-b border-surface-border/50"
                    : "bg-transparent"
                }`}
        >
            <div className="mx-auto max-w-container px-6 md:px-12">
                <div className="flex h-16 md:h-20 items-center justify-between">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 text-text-primary"
                    >
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent-indigo to-accent-violet flex items-center justify-center">
                            <span className="text-white text-sm font-bold">F</span>
                        </div>
                        <span className="text-base font-medium tracking-tight">
                            FairWork
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="text-sm text-text-muted transition-colors duration-300 hover:text-text-primary"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 rounded-pill bg-white px-6 py-2.5 text-sm font-medium text-backdrop transition-all duration-300 hover:bg-white/90 hover:shadow-glow-sm"
                        >
                            Launch App
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 16 16"
                                fill="none"
                            >
                                <path
                                    d="M6 3L11 8L6 13"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden flex flex-col gap-1.5 p-2"
                        aria-label="Toggle menu"
                    >
                        <span
                            className={`block h-px w-5 bg-text-primary transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[3.5px]" : ""
                                }`}
                        />
                        <span
                            className={`block h-px w-5 bg-text-primary transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[3.5px]" : ""
                                }`}
                        />
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="md:hidden bg-backdrop/95 backdrop-blur-xl border-b border-surface-border"
                >
                    <div className="px-6 py-6 space-y-4">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="block text-base text-text-muted hover:text-text-primary transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 rounded-pill bg-white px-6 py-2.5 text-sm font-medium text-backdrop mt-2"
                        >
                            Launch App
                        </Link>
                    </div>
                </motion.div>
            )}
        </motion.header>
    );
}
