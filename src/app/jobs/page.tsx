"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import JobCard from "@/components/jobs/JobCard";
import JitsiMeetModal from "@/components/meet/JitsiMeetModal";
import { supabase } from "@/lib/supabase";
import {
    Plus, Search, Briefcase, ChevronDown,
    Code, Wallet, Shield, Cpu, Palette, FileCode,
    SlidersHorizontal, X, Video,
} from "lucide-react";
import Link from "next/link";
import { useAccount } from "wagmi";

interface Job {
    id: string;
    contract_job_id: number;
    title: string;
    description: string;
    amount: number;
    deadline: number;
    client: string;
    freelancer?: string;
    status: string;
    created_at: string;
}

// Category-semantic accent palette — green primary, rich accents for variety
const PILL_STYLES = {
    green:  { bg: "rgba(29,191,115,0.1)", color: "#1DBF73", border: "rgba(29,191,115,0.28)",  icon: "#1DBF73",  glow: "rgba(29,191,115,0.20)"  },
    indigo: { bg: "rgba(99,102,241,0.1)", color: "#818cf8", border: "rgba(99,102,241,0.28)",  icon: "#818cf8",  glow: "rgba(99,102,241,0.20)"  },
    rose:   { bg: "rgba(244,63,94,0.1)", color: "#fb7185", border: "rgba(244,63,94,0.28)",   icon: "#fb7185",  glow: "rgba(244,63,94,0.20)"   },
    amber:  { bg: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "rgba(245,158,11,0.28)",  icon: "#fbbf24",  glow: "rgba(245,158,11,0.20)"  },
    teal:   { bg: "rgba(6,182,212,0.1)", color: "#22d3ee", border: "rgba(6,182,212,0.28)",   icon: "#22d3ee",  glow: "rgba(6,182,212,0.20)"   },
    purple: { bg: "rgba(139,92,246,0.1)", color: "#a78bfa", border: "rgba(139,92,246,0.28)",  icon: "#a78bfa",  glow: "rgba(139,92,246,0.20)"  },
} as const;

const servicePills: { name: string; icon: React.ElementType; variant: keyof typeof PILL_STYLES }[] = [
    { name: "Smart Contracts", icon: FileCode, variant: "green"  },
    { name: "DeFi Apps",       icon: Wallet,   variant: "indigo" },
    { name: "NFT Projects",    icon: Palette,  variant: "rose"   },
    { name: "AI Agents",       icon: Cpu,      variant: "amber"  },
    { name: "Auditing",        icon: Shield,   variant: "purple" },
    { name: "Frontend",        icon: Code,     variant: "teal"   },
];

const categories = [
    "Trending", "Smart Contracts", "AI & ML", "Web3 Apps",
    "Design", "Writing", "Business", "Finance", "AI Services",
];

const STATUS_FILTERS = [
    { value: "all",    label: "All Jobs" },
    { value: "open",   label: "Open" },
    { value: "active", label: "In Progress" },
];

const BUDGET_RANGES = [
    { label: "Any",        min: 0,     max: Infinity },
    { label: "< $100",     min: 0,     max: 100 },
    { label: "$100–$500",  min: 100,   max: 500 },
    { label: "$500–$2k",   min: 500,   max: 2000 },
    { label: "$2k+",       min: 2000,  max: Infinity },
];

// Shimmer skeleton — moving highlight sweep
function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <div
            className={`relative overflow-hidden rounded ${className ?? ""}`}
            style={{ background: "rgba(255,255,255,0.05)", ...style }}
        >
            <div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
                    animation: "shimmer 1.6s infinite",
                    transform: "translateX(-100%)",
                }}
            />
        </div>
    );
}

function SkeletonCard() {
    return (
        <>
            <style>{`
                @keyframes shimmer {
                    0%   { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
            `}</style>
            <div className="mb-4 bg-white/[0.02] border border-white/[0.08] backdrop-blur-md rounded-[1.25rem] p-6">
                <div className="flex flex-col md:flex-row gap-5">
                    {/* Avatar */}
                    <div className="shrink-0 mb-4 md:mb-0">
                        <Shimmer style={{ width: 48, height: 48, borderRadius: 12 }} />
                    </div>

                    {/* Middle */}
                    <div className="flex-1 min-w-0 pr-0 md:pr-6 border-b md:border-b-0 border-white/5 pb-4 md:pb-0">
                        {/* Meta row */}
                        <div className="flex items-center gap-2 mb-3">
                            <Shimmer style={{ width: 8, height: 8, borderRadius: "50%" }} />
                            <Shimmer style={{ width: 64, height: 12 }} />
                            <Shimmer style={{ width: 90, height: 12 }} />
                            <Shimmer style={{ width: 70, height: 12 }} />
                        </div>
                        {/* Title */}
                        <Shimmer style={{ width: "68%", height: 20, marginBottom: 10 }} />
                        {/* Description lines */}
                        <Shimmer style={{ width: "100%", height: 14, marginBottom: 6 }} />
                        <Shimmer style={{ width: "85%", height: 14, marginBottom: 14 }} />
                        {/* Tags */}
                        <div className="flex gap-2">
                            <Shimmer style={{ width: 60, height: 24, borderRadius: 4 }} />
                            <Shimmer style={{ width: 80, height: 24, borderRadius: 4 }} />
                            <Shimmer style={{ width: 70, height: 24, borderRadius: 4 }} />
                        </div>
                    </div>

                    {/* Right panel */}
                    <div
                        className="shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-40 md:pl-6 md:border-l border-white/5"
                    >
                        <div className="flex flex-col items-start md:items-end gap-1.5 w-full">
                            <Shimmer style={{ width: 46, height: 10 }} />
                            <Shimmer style={{ width: 80, height: 28 }} />
                            <Shimmer style={{ width: 38, height: 10 }} />
                        </div>
                        <div className="flex flex-col items-end gap-2 text-right mt-0 md:mt-6">
                            <Shimmer style={{ width: 80, height: 16 }} />
                            <Shimmer style={{ width: 60, height: 12 }} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function JobsPage() {
    const { address } = useAccount();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "open" | "active">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [budgetRange, setBudgetRange] = useState(0); // index into BUDGET_RANGES
    const [activeCategory, setActiveCategory] = useState(0);
    const [sortBy, setSortBy] = useState<"newest" | "budget_high" | "budget_low">("newest");
    const [meetRoom, setMeetRoom] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false); // mobile sidebar toggle

    const startTestMeet = () => {
        const room = `fairwork-test-${Math.random().toString(36).slice(2, 8)}`;
        setMeetRoom(room);
    };

    useEffect(() => {
        fetchJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    const fetchJobs = async () => {
        setIsLoading(true);
        let query = supabase.from("jobs").select("*").order("created_at", { ascending: false });
        if (filter === "open") query = query.eq("status", "OPEN");
        else if (filter === "active") query = query.in("status", ["WAITING_CLIENT_APPROVAL", "ACCEPTED", "SUBMITTED"]);
        else query = query.not("status", "in", '("CANCELLED","RESOLVED")');
        const { data, error } = await query;
        if (error) console.error("Error fetching jobs:", error);
        else setJobs(data || []);
        setIsLoading(false);
    };

    // Client-side filtering & sorting
    const filteredJobs = jobs
        .filter((job) => {
            const text = `${job.title ?? ""} ${job.description ?? ""}`.toLowerCase();
            const matchSearch = !searchQuery || text.includes(searchQuery.toLowerCase());
            const range = BUDGET_RANGES[budgetRange];
            const amountUSDC = job.amount / 1_000_000;
            const matchBudget = amountUSDC >= range.min && amountUSDC <= range.max;
            return matchSearch && matchBudget;
        })
        .sort((a, b) => {
            if (sortBy === "budget_high") return b.amount - a.amount;
            if (sortBy === "budget_low")  return a.amount - b.amount;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

    return (
        <div className="min-h-screen relative z-10 text-white backdrop-blur-[2px]">
            {/* The global 3D canvas is behind this, so keep backgrounds translucent */}
            <Navbar />

            {/* ── Category tabs ── */}
            <div className="border-b border-white/5 bg-black/40 backdrop-blur-xl">
                <div className="max-w-[1600px] mx-auto px-6 sm:px-10">
                    <div className="flex gap-0 overflow-x-auto scrollbar-hide">
                        {categories.map((cat, i) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(i)}
                                className="shrink-0 text-[13px] whitespace-nowrap px-4 py-4 transition-all duration-150 relative"
                                style={{
                                    fontWeight: activeCategory === i ? 700 : 500,
                                    color: activeCategory === i ? "white" : "rgba(255,255,255,0.5)",
                                    borderBottom: activeCategory === i ? "2px solid #1DBF73" : "2px solid transparent",
                                }}
                            >
                                {cat}
                                {activeCategory === i && (
                                     <span className="absolute bottom-0 left-0 w-full h-[15px] bg-[#1DBF73] blur-[10px] opacity-30 pointer-events-none" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Page Header ── */}
            <div className="border-b border-white/5 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-md">
                <div className="max-w-[1600px] mx-auto px-6 sm:px-10 pt-16 pb-12">

                    {/* Title row */}
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-10">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#1DBF73] inline-block shadow-[0_0_8px_#1DBF73]" />
                                <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-white/50">
                                    Live on Polygon
                                </span>
                            </div>
                            <h1
                                className="font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60"
                                style={{ fontSize: "clamp(2rem,4vw,3.5rem)", letterSpacing: "-0.03em", lineHeight: 1.1 }}
                            >
                                Browse Web3 Jobs
                            </h1>
                            <p className="text-[16px] text-white/50 font-light max-w-xl leading-relaxed">
                                Deep liquidity and fast milestones. Funds are locked in smart contract escrow until you approve delivery.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 mt-2">
                            <button
                                onClick={startTestMeet}
                                className="flex items-center gap-2 px-5 py-3 text-[14px] font-bold transition-all duration-300 rounded-full bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:text-white"
                            >
                                <Video className="w-4 h-4" /> Test Meet
                            </button>
                            <Link
                                href="/jobs/create"
                                className="flex items-center gap-2 px-5 py-3 text-[14px] font-bold text-white rounded-full transition-all duration-300 hover:scale-105"
                                style={{ background: "#1DBF73", boxShadow: "0 4px 20px rgba(29, 191, 115, 0.4)" }}
                            >
                                <Plus className="w-4 h-4" strokeWidth={3} /> Post a Job
                            </Link>
                        </div>
                    </div>

                    {/* Stats — plain editorial numbers */}
                    <div className="flex items-center gap-8 mb-8 flex-wrap">
                        {[
                            { value: filteredJobs.length.toString(), label: "jobs" },
                            { value: "2.5%",  label: "platform fee" },
                            { value: "$0",    label: "hidden charges" },
                            { value: "24h",   label: "avg resolution" },
                        ].map((s, i) => (
                            <div key={i} className="flex items-baseline gap-2">
                                {i > 0 && <div className="w-px h-5 bg-white/10 mr-6" />}
                                <span className="font-black text-[22px]" style={{ color: "white", letterSpacing: "-0.02em" }}>{s.value}</span>
                                <span className="text-[11px] uppercase tracking-widest font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Service filter chips */}
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide flex-wrap">
                        {servicePills.map((pill) => {
                            const styles = PILL_STYLES[pill.variant];
                            return (
                                <button
                                    key={pill.name}
                                    className="group flex items-center gap-2 shrink-0 px-4 py-2 text-[13px] font-bold rounded-full transition-all duration-300 border backdrop-blur-xl"
                                    style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.6)", borderColor: "rgba(255,255,255,0.05)" }}
                                    onMouseEnter={(e) => { 
                                        (e.currentTarget as HTMLElement).style.background = styles.bg; 
                                        (e.currentTarget as HTMLElement).style.color = styles.color; 
                                        (e.currentTarget as HTMLElement).style.borderColor = styles.border; 
                                    }}
                                    onMouseLeave={(e) => { 
                                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; 
                                        (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)";
                                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)";
                                    }}
                                >
                                    <pill.icon className="w-4 h-4 transition-colors" />
                                    {pill.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Content: sidebar + list ── */}
            <div className="max-w-[1600px] mx-auto px-6 sm:px-10 py-12">
                <div className="flex gap-12">

                    {/* ── Filter Sidebar ── */}
                    <aside className="hidden lg:block w-52 shrink-0">
                        <div className="sticky top-32">

                            {/* Search */}
                            <div className="relative mb-10">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.4)" }} />
                                <input
                                    type="text"
                                    placeholder="Filter jobs…"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 text-[14px] outline-none rounded-xl transition-all"
                                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)")}
                                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.4)" }}>
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Status */}
                            <div className="mb-10">
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>Status</p>
                                <div className="space-y-1">
                                    {STATUS_FILTERS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setFilter(opt.value as "all" | "open" | "active")}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-bold transition-all duration-300"
                                            style={filter === opt.value
                                                ? { background: "rgba(255,255,255,0.1)", color: "white" }
                                                : { color: "rgba(255,255,255,0.5)" }
                                            }
                                            onMouseEnter={(e) => { if (filter !== opt.value) (e.currentTarget as HTMLElement).style.color = "white"; }}
                                            onMouseLeave={(e) => { if (filter !== opt.value) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
                                        >
                                            {filter === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-[#1DBF73] shrink-0 shadow-[0_0_8px_#1DBF73]" />}
                                            <span className={filter === opt.value ? "" : "ml-4"}>{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Budget */}
                            <div className="mb-10">
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>Budget</p>
                                <div className="space-y-1">
                                    {BUDGET_RANGES.map((range, i) => (
                                        <button
                                            key={range.label}
                                            onClick={() => setBudgetRange(i)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-bold transition-all duration-300"
                                            style={budgetRange === i
                                                ? { background: "rgba(255,255,255,0.1)", color: "white" }
                                                : { color: "rgba(255,255,255,0.5)" }
                                            }
                                            onMouseEnter={(e) => { if (budgetRange !== i) (e.currentTarget as HTMLElement).style.color = "white"; }}
                                            onMouseLeave={(e) => { if (budgetRange !== i) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
                                        >
                                            {budgetRange === i && <span className="w-1.5 h-1.5 rounded-full bg-[#1DBF73] shrink-0 shadow-[0_0_8px_#1DBF73]" />}
                                            <span className={budgetRange === i ? "" : "ml-4"}>{range.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort */}
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>Sort</p>
                                <div className="space-y-1">
                                    {([
                                        { value: "newest",      label: "Newest first" },
                                        { value: "budget_high", label: "Highest budget" },
                                        { value: "budget_low",  label: "Lowest budget" },
                                    ] as const).map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setSortBy(opt.value)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-bold transition-all duration-300"
                                            style={sortBy === opt.value
                                                ? { background: "rgba(255,255,255,0.1)", color: "white" }
                                                : { color: "rgba(255,255,255,0.5)" }
                                            }
                                            onMouseEnter={(e) => { if (sortBy !== opt.value) (e.currentTarget as HTMLElement).style.color = "white"; }}
                                            onMouseLeave={(e) => { if (sortBy !== opt.value) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
                                        >
                                            {sortBy === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-[#1DBF73] shrink-0 shadow-[0_0_8px_#1DBF73]" />}
                                            <span className={sortBy === opt.value ? "" : "ml-4"}>{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* ── Main content ── */}
                    <div className="flex-1 min-w-0">

                        {/* Mobile toolbar */}
                        <div className="flex lg:hidden items-center gap-3 mb-8">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    type="text"
                                    placeholder="Search jobs…"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 text-[14px] outline-none rounded-xl bg-white/5 border border-white/10 text-white"
                                />
                            </div>
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="flex items-center gap-2 px-4 py-3 text-[14px] font-bold rounded-xl bg-white/5 border border-white/10 text-white"
                            >
                                <SlidersHorizontal className="w-4 h-4" /> Filters
                            </button>
                            <div className="relative shrink-0">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                    className="pl-4 pr-10 py-3 text-[14px] font-bold appearance-none outline-none rounded-xl cursor-pointer bg-white/5 border border-white/10 text-white"
                                >
                                    <option value="newest" className="bg-[#0a0f1e] text-white">Newest</option>
                                    <option value="budget_high" className="bg-[#0a0f1e] text-white">Budget ↑</option>
                                    <option value="budget_low" className="bg-[#0a0f1e] text-white">Budget ↓</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-white/50" />
                            </div>
                        </div>

                        {/* Mobile filter panel */}
                        <AnimatePresence>
                            {sidebarOpen && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="lg:hidden mb-8 overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
                                >
                                    <div className="p-6 grid grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4 text-white/40">Status</p>
                                            {STATUS_FILTERS.map((opt) => (
                                                <button key={opt.value} onClick={() => setFilter(opt.value as "all" | "open" | "active")}
                                                    className="w-full text-left px-3 py-2.5 rounded-lg text-[14px] font-bold transition-all mb-1"
                                                    style={filter === opt.value ? { background: "rgba(255,255,255,0.1)", color: "white" } : { color: "rgba(255,255,255,0.5)" }}>
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4 text-white/40">Budget</p>
                                            {BUDGET_RANGES.map((range, i) => (
                                                <button key={range.label} onClick={() => setBudgetRange(i)}
                                                    className="w-full text-left px-3 py-2.5 rounded-lg text-[14px] font-bold transition-all mb-1"
                                                    style={budgetRange === i ? { background: "rgba(255,255,255,0.1)", color: "white" } : { color: "rgba(255,255,255,0.5)" }}>
                                                    {range.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Results count + divider */}
                        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
                            <p className="text-[14px] font-light text-white/60">
                                <span className="font-black text-white">{filteredJobs.length}</span> results
                            </p>
                            {searchQuery && (
                                <span className="text-[12px] font-bold tracking-widest px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80">
                                    "{searchQuery}" <button onClick={() => setSearchQuery("")} className="ml-2 hover:text-white transition-colors text-white/40 font-black">×</button>
                                </span>
                            )}
                        </div>

                        {/* ── Job List ── */}
                        {isLoading ? (
                            <div className="flex flex-col">
                                {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
                            </div>
                        ) : filteredJobs.length === 0 ? (
                            <div className="text-center py-32 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
                                <Briefcase className="w-12 h-12 mx-auto mb-6 text-white/20" />
                                <h3 className="font-bold mb-2 text-[20px] text-white tracking-wide">No jobs found</h3>
                                <p className="text-[15px] mb-8 font-light text-white/50">
                                    {searchQuery ? `No results for "${searchQuery}"` : "Be the first to post a job."}
                                </p>
                                <Link
                                    href="/jobs/create"
                                    className="inline-flex items-center gap-2 px-6 py-3 text-[14px] font-bold text-white rounded-full bg-[#1DBF73] bg-opacity-[0.85] hover:bg-opacity-100 transition-all hover:scale-105 shadow-[0_0_20px_rgba(29,191,115,0.3)]"
                                >
                                    Post a Job
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {filteredJobs.map((job) => (
                                    <JobCard key={job.id} job={job} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {meetRoom && (
                <JitsiMeetModal
                    roomName={meetRoom}
                    displayName={address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "FairWork User"}
                    onClose={() => setMeetRoom(null)}
                />
            )}
        </div>
    );
}
