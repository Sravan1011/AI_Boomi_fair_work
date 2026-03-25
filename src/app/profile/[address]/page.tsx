"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAccount } from "wagmi";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import LandingFooter from "@/components/landing/LandingFooter";
import Image from "next/image";
import {
    Star, Globe, Twitter, Github, Edit3, Briefcase,
    Award, MapPin, Calendar, ExternalLink, CheckCircle2,
    Zap, Shield, Activity,
} from "lucide-react";
import { useGSAP } from "@/hooks/useGSAP";
import gsap from "gsap";

// ─── Types ────────────────────────────────────────────────────────────────────

type Profile = {
    wallet: string;
    display_name: string | null;
    bio: string | null;
    title: string | null;
    skills: string[];
    avatar_url: string | null;
    website: string | null;
    twitter: string | null;
    github: string | null;
    location: string | null;
    role: string | null;
    experience_level: string | null;
    hourly_rate: number | null;
    total_jobs_completed: number;
    total_earned: number;
    avg_rating: number;
    created_at: string;
};

type Review = {
    id: string;
    rating: number;
    comment: string | null;
    reviewer: string;
    reviewer_role: string;
    created_at: string;
};

type Job = {
    id: string;
    title: string;
    amount: number;
    status: string;
    created_at: string;
};

// ─── Activity Grid ────────────────────────────────────────────────────────────

const WEEKS = 52;
const DAYS = 7;
const DAY_MS = 86400000;

function buildActivityGrid(dates: string[]) {
    const countMap: Record<string, number> = {};
    dates.forEach((d) => { const key = d.slice(0, 10); countMap[key] = (countMap[key] || 0) + 1; });
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const startOffset = (today.getDay() + 1) % 7;
    const gridStart = new Date(today.getTime() - (WEEKS * DAYS - 1 + startOffset) * DAY_MS);
    const grid: { date: string; count: number }[][] = [];
    for (let w = 0; w < WEEKS; w++) {
        const week: { date: string; count: number }[] = [];
        for (let d = 0; d < DAYS; d++) {
            const cell = new Date(gridStart.getTime() + (w * DAYS + d) * DAY_MS);
            const key = cell.toISOString().slice(0, 10);
            week.push({ date: key, count: countMap[key] || 0 });
        }
        grid.push(week);
    }
    return grid;
}

function getCellBg(count: number) {
    if (count === 0) return "rgba(255,255,255,0.02)";
    if (count === 1) return "rgba(29,191,115,0.30)";
    if (count === 2) return "rgba(29,191,115,0.55)";
    if (count === 3) return "rgba(29,191,115,0.75)";
    return "#1DBF73";
}

function getMonthLabels(grid: { date: string; count: number }[][]) {
    const labels: { label: string; weekIndex: number }[] = [];
    let lastMonth = "";
    grid.forEach((week, wi) => {
        const month = new Date(week[0].date).toLocaleString("default", { month: "short" });
        if (month !== lastMonth) { labels.push({ label: month, weekIndex: wi }); lastMonth = month; }
    });
    return labels;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Hero */}
            <div className="bg-black/40 border-b border-white/5 backdrop-blur-md pb-8">
                <div className="h-40 bg-white/5" />
                <div className="max-w-5xl mx-auto px-6 pt-4 pb-8">
                    <div className="flex items-end gap-6 mb-10">
                        <div className="w-[100px] h-[100px] rounded-full bg-white/10 shrink-0 -mt-16 border-[4px] border-[#0a0f1e]" />
                        <div className="flex-1 space-y-3 pb-2">
                            <div className="h-8 w-64 rounded-xl bg-white/10" />
                            <div className="h-5 w-40 rounded-lg bg-white/5" />
                            <div className="flex gap-3">
                                <div className="h-6 w-24 rounded-full bg-white/10" />
                                <div className="h-6 w-20 rounded-full bg-white/5" />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-24 rounded-2xl bg-white/5" />
                        ))}
                    </div>
                </div>
            </div>
            {/* Body */}
            <div className="max-w-5xl mx-auto px-6 py-12 grid lg:grid-cols-[320px_1fr] gap-8">
                <div className="space-y-6">
                    <div className="h-48 rounded-2xl bg-white/5" />
                    <div className="h-40 rounded-2xl bg-white/5" />
                </div>
                <div className="space-y-6">
                    <div className="h-64 rounded-2xl bg-white/5" />
                    <div className="h-64 rounded-2xl bg-white/5" />
                </div>
            </div>
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRow({ rating }: { rating: number }) {
    return (
        <div className="flex gap-1 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-3.5 h-3.5"
                    style={{ fill: i <= rating ? "#f59e0b" : "transparent", color: i <= rating ? "#f59e0b" : "rgba(255,255,255,0.15)" }} />
            ))}
        </div>
    );
}

type StatVariant = "green" | "amber" | "indigo" | "teal" | "purple" | "rose" | "dark";
const STAT_STYLES: Record<StatVariant, { bg: string; border: string; value: string; label: string; shadow: string }> = {
    dark: { bg: "rgba(255,255,255,0.02)", border: "rgba(255,255,255,0.05)", value: "#ffffff", label: "rgba(255,255,255,0.4)", shadow: "0 4px 24px rgba(0,0,0,0.4)" },
    green: { bg: "rgba(29,191,115,0.05)", border: "rgba(29,191,115,0.15)", value: "#1DBF73", label: "rgba(29,191,115,0.6)", shadow: "0 4px 24px rgba(29,191,115,0.1)" },
    amber: { bg: "rgba(245,158,11,0.05)", border: "rgba(245,158,11,0.15)", value: "#fbbf24", label: "rgba(251,191,36,0.6)", shadow: "0 4px 24px rgba(245,158,11,0.1)" },
    indigo: { bg: "rgba(99,102,241,0.05)", border: "rgba(99,102,241,0.15)", value: "#818cf8", label: "rgba(129,140,248,0.6)", shadow: "0 4px 24px rgba(99,102,241,0.1)" },
    teal: { bg: "rgba(6,182,212,0.05)", border: "rgba(6,182,212,0.15)", value: "#22d3ee", label: "rgba(34,211,238,0.6)", shadow: "0 4px 24px rgba(6,182,212,0.1)" },
    purple: { bg: "rgba(139,92,246,0.05)", border: "rgba(139,92,246,0.15)", value: "#a78bfa", label: "rgba(167,139,250,0.6)", shadow: "0 4px 24px rgba(139,92,246,0.1)" },
    rose: { bg: "rgba(244,63,94,0.05)", border: "rgba(244,63,94,0.15)", value: "#fb7185", label: "rgba(251,113,133,0.6)", shadow: "0 4px 24px rgba(244,63,94,0.1)" },
};

function StatCard({ value, label, variant = "dark" }: { value: string; label: string; variant?: StatVariant }) {
    const s = STAT_STYLES[variant];
    return (
        <div
            className="text-center px-4 py-6 rounded-2xl transition-transform duration-300 hover:-translate-y-1.5 backdrop-blur-xl group"
            style={{ background: s.bg, border: `1px solid ${s.border}`, boxShadow: s.shadow }}
        >
            <div className="text-[32px] font-black mb-1 transition-all group-hover:drop-shadow-[0_0_12px_currentColor]" style={{ color: s.value, letterSpacing: "-0.04em", lineHeight: 1 }}>
                {value}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] mt-3" style={{ color: s.label }}>
                {label}
            </div>
        </div>
    );
}

const JOB_STATUS: Record<string, { label: string; bg: string; color: string; border: string }> = {
    OPEN: { label: "Open", bg: "rgba(29,191,115,0.1)", color: "#1DBF73", border: "rgba(29,191,115,0.2)" },
    WAITING_CLIENT_APPROVAL: { label: "Pending", bg: "rgba(99,102,241,0.1)", color: "#818cf8", border: "rgba(99,102,241,0.2)" },
    ACCEPTED: { label: "In Progress", bg: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "rgba(59,130,246,0.2)" },
    SUBMITTED: { label: "Under Review", bg: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "rgba(245,158,11,0.2)" },
    APPROVED: { label: "Completed", bg: "rgba(29,191,115,0.1)", color: "#1DBF73", border: "rgba(29,191,115,0.2)" },
    DISPUTED: { label: "Disputed", bg: "rgba(239,68,68,0.1)", color: "#f87171", border: "rgba(239,68,68,0.2)" },
    RESOLVED: { label: "Resolved", bg: "rgba(139,92,246,0.1)", color: "#a78bfa", border: "rgba(139,92,246,0.2)" },
};

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = "about" | "activity" | "jobs" | "reviews";

export default function ProfilePage() {
    const { address: walletAddress } = useParams<{ address: string }>();
    const { address: myAddress } = useAccount();
    const isOwn = myAddress?.toLowerCase() === walletAddress?.toLowerCase();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [activityDates, setActivityDates] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>("about");
    const [hoveredCell, setHoveredCell] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

    const avatarRef = useRef<HTMLDivElement>(null);
    const nameRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLDivElement>(null);

    // ── Fetch ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!walletAddress) return;
        const addr = typeof walletAddress === 'string' ? walletAddress.toLowerCase() : '';
        Promise.all([
            supabase.from("profiles").select("*").eq("wallet", addr).maybeSingle(),
            supabase.from("reviews").select("*").eq("reviewee", addr).order("created_at", { ascending: false }).limit(20),
            supabase.from("jobs").select("id,title,amount,status,created_at")
                .or(`client.eq.${addr},freelancer.eq.${addr}`)
                .neq("status", "CANCELLED")
                .order("created_at", { ascending: false })
                .limit(8),
        ]).then(([p, r, j]) => {
            setProfile(p.data as Profile | null);
            setReviews((r.data as Review[]) || []);
            const allJobs = (j.data as Job[]) || [];
            setJobs(allJobs);
            setActivityDates(allJobs.map((jb) => jb.created_at));
            setLoading(false);
        }).catch(err => {
            console.error("Error fetching profile stats:", err);
            setLoading(false);
        });
    }, [walletAddress]);

    // ── GSAP ──────────────────────────────────────────────────────────────────
    useGSAP((gsap) => {
        if (loading) return;
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        if (avatarRef.current)
            tl.from(avatarRef.current, { scale: 0.7, opacity: 0, duration: 0.8, ease: "back.out(1.5)" });
        if (nameRef.current)
            tl.from(nameRef.current.children, { y: 30, opacity: 0, stagger: 0.1, duration: 0.8 }, "-=0.6");
        if (statsRef.current)
            tl.from(statsRef.current.children, { y: 40, opacity: 0, stagger: 0.1, duration: 0.8, ease: "back.out(1.2)" }, "-=0.5");

        if (sidebarRef.current)
            gsap.from(sidebarRef.current.children, { x: -40, opacity: 0, stagger: 0.15, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: sidebarRef.current, start: "top 85%" } });
        if (mainRef.current)
            gsap.from(mainRef.current.children, { y: 40, opacity: 0, stagger: 0.15, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: mainRef.current, start: "top 85%" } });

        if (gridRef.current) {
            const cells = gridRef.current.querySelectorAll(".hcell");
            gsap.from(cells, { opacity: 0, scale: 0, stagger: { amount: 1.5, from: "start" }, ease: "power2.out", duration: 0.4, scrollTrigger: { trigger: gridRef.current, start: "top 85%" } });
        }
    }, [loading]);

    // ── Derived ───────────────────────────────────────────────────────────────
    let parsedAddress = typeof walletAddress === 'string' ? walletAddress : '';
    const initials = profile?.display_name ? profile.display_name.slice(0, 2).toUpperCase() : parsedAddress?.slice(2, 4).toUpperCase() ?? "??";
    const shortAddr = parsedAddress ? `${parsedAddress.slice(0, 6)}…${parsedAddress.slice(-4)}` : "";
    const displayName = profile?.display_name || shortAddr;
    const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—";
    const grid = buildActivityGrid(activityDates);
    const monthLabels = getMonthLabels(grid);
    const totalActivity = activityDates.length;

    // Streak & activity stats
    const flatCells = grid.flat();
    const activeDays = flatCells.filter((c) => c.count > 0).length;
    const busiestCell = [...flatCells].sort((a, b) => b.count - a.count)[0];
    // current streak
    let currentStreak = 0;
    for (let i = flatCells.length - 1; i >= 0; i--) {
        if (flatCells[i].count > 0) currentStreak++;
        else if (currentStreak > 0) break;
    }
    // longest streak
    let longestStreak = 0, tempStreak = 0;
    flatCells.forEach((c) => {
        if (c.count > 0) { tempStreak++; longestStreak = Math.max(longestStreak, tempStreak); }
        else tempStreak = 0;
    });
    const roleLabel = profile?.role === "client" ? "Client" : profile?.role === "both" ? "Client & Freelancer" : "Freelancer";
    const expLabel = profile?.experience_level
        ? profile.experience_level.charAt(0).toUpperCase() + profile.experience_level.slice(1)
        : null;

    const TABS: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
        { id: "about", label: "Overview", icon: <Shield className="w-4 h-4" /> },
        { id: "activity", label: "Activity", icon: <Activity className="w-4 h-4" />, count: totalActivity },
        { id: "jobs", label: "Jobs", icon: <Briefcase className="w-4 h-4" />, count: jobs.length },
        { id: "reviews", label: "Reviews", icon: <Award className="w-4 h-4" />, count: reviews.length },
    ];

    if (loading) {
        return (
            <div className="min-h-screen relative z-10 text-white backdrop-blur-[2px]">
                <Navbar />
                <ProfileSkeleton />
            </div>
        );
    }

    return (
        <div className="min-h-screen relative z-10 text-white backdrop-blur-[2px]">
            <Navbar />

            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <div className="relative border-b border-white/5 bg-black/40 backdrop-blur-2xl">
                {/* Cover banner — super deep dark glass cinematic */}
                <div
                    className="relative h-48 sm:h-64 overflow-hidden w-full"
                >
                    {/* Dark gradient base */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#030712] via-[#051014] to-[#020617]" />

                    {/* Massive background glow orbs */}
                    <div className="absolute top-1/2 left-1/4 w-[800px] h-[800px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" style={{ background: "radial-gradient(circle, rgba(29,191,115,0.08), transparent 60%)" }} />
                    <div className="absolute top-1/2 right-0 w-[600px] h-[600px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)" }} />
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] rounded-full pointer-events-none translate-y-1/2" style={{ background: "radial-gradient(circle, rgba(245,158,11,0.05), transparent 70%)" }} />

                    {/* Grid texture overlay */}
                    <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "40px 40px", transform: "perspective(1000px) rotateX(60deg) translateY(-100px) translateZ(-200px)" }} />

                    {/* Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </div>

                <div className="max-w-[1600px] mx-auto px-6 pt-4 pb-12">
                    <div className="relative">

                        {/* Avatar + name row */}
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 flex-wrap mb-12">
                            {/* Avatar */}
                            <div ref={avatarRef} className="relative shrink-0 -mt-24 md:-mt-32">
                                {profile?.avatar_url ? (
                                    <Image src={profile.avatar_url} width={160} height={160} alt={displayName}
                                        className="w-[140px] h-[140px] md:w-[180px] md:h-[180px] rounded-full object-cover shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
                                        style={{ border: "4px solid #030712" }}
                                    />
                                ) : (
                                    <div
                                        className="w-[140px] h-[140px] md:w-[180px] md:h-[180px] rounded-full flex items-center justify-center text-5xl font-black text-white shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
                                        style={{ background: "linear-gradient(135deg, #1DBF73, #158a53)", border: "4px solid #030712", textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}
                                    >
                                        {initials}
                                    </div>
                                )}
                                {/* Online indicator */}
                                <div
                                    className="absolute bottom-4 right-4 md:bottom-6 md:right-6 w-5 h-5 md:w-6 md:h-6 rounded-full"
                                    style={{ background: "#1DBF73", border: "4px solid #030712", boxShadow: "0 0 15px #1DBF73" }}
                                />
                            </div>

                            {/* Name + meta */}
                            <div ref={nameRef} className="flex-1 min-w-[300px] text-center md:text-left">
                                {/* Name row */}
                                <div className="flex flex-col md:flex-row items-center gap-4 flex-wrap mb-3">
                                    <h1
                                        className="font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 drop-shadow-sm"
                                        style={{ fontSize: "clamp(2rem,4vw,3.5rem)", letterSpacing: "-0.04em", lineHeight: 1.1 }}
                                    >
                                        {displayName}
                                    </h1>

                                    <div className="flex items-center gap-3">
                                        <span
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded border border-[#1DBF73]/20"
                                            style={{ background: "rgba(29,191,115,0.1)", color: "#1DBF73", boxShadow: "0 0 10px rgba(29,191,115,0.1) inset" }}
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                                        </span>

                                        {isOwn && (
                                            <Link href="/profile/edit"
                                                className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded border border-white/10"
                                                style={{ background: "rgba(255,255,255,0.05)", color: "white" }}
                                            >
                                                <Edit3 className="w-3 h-3" /> Edit
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {/* Title */}
                                {profile?.title && (
                                    <p className="text-xl md:text-2xl font-medium mb-4" style={{ color: "#1DBF73", letterSpacing: "-0.01em" }}>
                                        {profile.title}
                                    </p>
                                )}

                                {/* Meta row */}
                                <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap mb-5">
                                    {profile?.location && (
                                        <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                                            <MapPin className="w-4 h-4" />{profile.location}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                                        <Calendar className="w-4 h-4" />Since {memberSince}
                                    </span>
                                    {expLabel && (
                                        <span
                                            className="px-3 py-1 text-xs font-bold uppercase tracking-widest rounded border border-white/10"
                                            style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.7)" }}
                                        >
                                            {expLabel}
                                        </span>
                                    )}
                                    <span
                                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-widest rounded border border-white/10"
                                        style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.7)" }}
                                    >
                                        <Zap className="w-3.5 h-3.5 text-[#f59e0b]" />
                                        {roleLabel}
                                    </span>
                                </div>

                                {/* Social links */}
                                <div className="flex items-center justify-center md:justify-start gap-6 flex-wrap">
                                    {profile?.github && (
                                        <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener"
                                            className="flex items-center gap-2 text-sm font-bold transition-all hover:-translate-y-0.5"
                                            style={{ color: "rgba(255,255,255,0.5)" }}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
                                        >
                                            <Github className="w-4 h-4 text-white" />{profile.github}
                                        </a>
                                    )}
                                    {profile?.twitter && (
                                        <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener"
                                            className="flex items-center gap-2 text-sm font-bold transition-all hover:-translate-y-0.5"
                                            style={{ color: "rgba(255,255,255,0.5)" }}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
                                        >
                                            <Twitter className="w-4 h-4 text-blue-400" />@{profile.twitter}
                                        </a>
                                    )}
                                    {profile?.website && (
                                        <a href={profile.website} target="_blank" rel="noopener"
                                            className="flex items-center gap-2 text-sm font-bold transition-all hover:-translate-y-0.5"
                                            style={{ color: "rgba(255,255,255,0.5)" }}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
                                        >
                                            <Globe className="w-4 h-4 text-teal-400" />Website
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats glass row */}
                        <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-8">
                            <StatCard value={String(profile?.total_jobs_completed ?? 0)} label="Jobs Done" variant="dark" />
                            <StatCard value={profile?.avg_rating ? `${profile.avg_rating.toFixed(1)} ★` : "—"} label="Avg Rating" variant="amber" />
                            <StatCard value={String(reviews.length)} label="Reviews" variant="indigo" />
                            {profile?.hourly_rate
                                ? <StatCard value={`$${profile.hourly_rate}/hr`} label="Hourly Rate" variant="teal" />
                                : <StatCard value={String(totalActivity)} label="Activity" variant="teal" />
                            }
                        </div>
                    </div>{/* end relative */}
                </div>{/* end max-w-[1600px] content */}

                {/* ── Tab Bar ─────────────────────────────────────────────── */}
                <div className="max-w-[1600px] mx-auto px-6 mt-4">
                    <div className="flex gap-2 border-b border-white/10 flex-wrap">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="relative flex items-center gap-2 px-6 py-4 text-[13px] font-bold uppercase tracking-widest transition-all duration-300"
                                style={
                                    activeTab === tab.id
                                        ? { color: "white" }
                                        : { color: "rgba(255,255,255,0.4)" }
                                }
                            >
                                {tab.icon}
                                {tab.label}
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span
                                        className="text-[10px] font-black px-2 py-0.5 rounded ml-1"
                                        style={
                                            activeTab === tab.id
                                                ? { background: "rgba(29,191,115,0.15)", color: "#1DBF73" }
                                                : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }
                                        }
                                    >
                                        {tab.count}
                                    </span>
                                )}
                                {activeTab === tab.id && (
                                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#1DBF73] shadow-[0_0_10px_#1DBF73]" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Tab Content ───────────────────────────────────────────────── */}
            <div className="max-w-[1600px] mx-auto px-6 py-12 pb-32">

                {/* ABOUT tab */}
                {activeTab === "about" && (
                    <div className="grid lg:grid-cols-[340px_1fr] gap-8 items-start">
                        {/* Sidebar */}
                        <div ref={sidebarRef} className="flex flex-col gap-6">
                            {profile?.bio && (
                                <div
                                    className="p-8 rounded-[2rem] backdrop-blur-xl border border-white/10"
                                    style={{ background: "rgba(255,255,255,0.02)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
                                >
                                    <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#1DBF73]" /> About
                                    </p>
                                    <p className="text-[15px] leading-[1.8] font-light text-white/80">{profile.bio}</p>
                                </div>
                            )}

                            {(profile?.skills ?? []).length > 0 && (
                                <div
                                    className="p-8 rounded-[2rem] backdrop-blur-xl border border-white/10"
                                    style={{ background: "rgba(255,255,255,0.02)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
                                >
                                    <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Skills
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {profile!.skills.map((s, idx) => {
                                            const palette = [
                                                { bg: "rgba(29,191,115,0.1)", color: "#1DBF73", border: "rgba(29,191,115,0.2)" },
                                                { bg: "rgba(99,102,241,0.1)", color: "#818cf8", border: "rgba(99,102,241,0.2)" },
                                                { bg: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "rgba(245,158,11,0.2)" },
                                                { bg: "rgba(6,182,212,0.1)", color: "#22d3ee", border: "rgba(6,182,212,0.2)" },
                                                { bg: "rgba(139,92,246,0.1)", color: "#a78bfa", border: "rgba(139,92,246,0.2)" },
                                                { bg: "rgba(244,63,94,0.1)", color: "#fb7185", border: "rgba(244,63,94,0.2)" },
                                                { bg: "rgba(255,255,255,0.05)", color: "white", border: "rgba(255,255,255,0.1)" },
                                            ];
                                            const p = palette[idx % palette.length];
                                            return (
                                                <span
                                                    key={s}
                                                    className="px-3 py-1.5 text-xs font-bold tracking-wider rounded border"
                                                    style={{ background: p.bg, color: p.color, borderColor: p.border }}
                                                >
                                                    {s}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div
                                className="p-8 rounded-[2rem] backdrop-blur-xl border border-white/10"
                                style={{ background: "rgba(255,255,255,0.02)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
                            >
                                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Wallet
                                </p>
                                <p className="text-[13px] font-mono break-all mb-4 text-white/70 p-4 rounded-xl bg-black/40 border border-white/5">{parsedAddress}</p>
                                <a
                                    href={`https://polygonscan.com/address/${parsedAddress}`}
                                    target="_blank" rel="noopener"
                                    className="inline-flex items-center gap-2 text-sm font-bold transition-all hover:-translate-y-0.5 hover:text-[#1DBF73]"
                                    style={{ color: "rgba(29,191,115,0.8)" }}
                                >
                                    <ExternalLink className="w-4 h-4" />View on Polygonscan
                                </a>
                            </div>
                        </div>

                        {/* Main: recent jobs preview on about tab */}
                        <div ref={mainRef} className="flex flex-col gap-6">
                            {jobs.length > 0 && (
                                <div
                                    className="p-8 rounded-[2rem] backdrop-blur-xl border border-white/10"
                                    style={{ background: "rgba(255,255,255,0.02)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
                                >
                                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#1DBF73]/10 flex items-center justify-center border border-[#1DBF73]/20">
                                                <Briefcase className="w-5 h-5 text-[#1DBF73]" />
                                            </div>
                                            <h2 className="text-xl font-bold text-white tracking-tight">Recent Jobs</h2>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab("jobs")}
                                            className="text-[13px] font-bold uppercase tracking-wider transition-colors hover:text-white"
                                            style={{ color: "rgba(29,191,115,0.8)" }}
                                        >
                                            View all {jobs.length} →
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {jobs.slice(0, 4).map((job) => {
                                            const s = JOB_STATUS[job.status] ?? JOB_STATUS.OPEN;
                                            return (
                                                <Link key={job.id} href={`/jobs/${job.id}`}
                                                    className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 rounded-xl transition-all duration-300 group hover:-translate-y-1 backdrop-blur-md"
                                                    style={{ border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}
                                                >
                                                    <span
                                                        className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded border self-start sm:self-auto shrink-0"
                                                        style={{ background: s.bg, color: s.color, borderColor: s.border }}
                                                    >
                                                        {s.label}
                                                    </span>
                                                    <span className="flex-1 text-[15px] font-bold truncate text-white/80 group-hover:text-white transition-colors">
                                                        {job.title}
                                                    </span>
                                                    <div className="hidden sm:flex w-8 h-8 rounded-full bg-white/5 items-center justify-center group-hover:bg-[#1DBF73] transition-colors border border-white/10">
                                                        <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {reviews.length > 0 && (
                                <div
                                    className="p-8 rounded-[2rem] backdrop-blur-xl border border-white/10"
                                    style={{ background: "rgba(255,255,255,0.02)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
                                >
                                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center border border-amber-500/20" style={{ background: "rgba(245,158,11,0.1)" }}>
                                                <Award className="w-5 h-5 text-amber-500" />
                                            </div>
                                            <h2 className="text-xl font-bold text-white tracking-tight">Latest Review</h2>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab("reviews")}
                                            className="text-[13px] font-bold uppercase tracking-wider transition-colors hover:text-white"
                                            style={{ color: "rgba(29,191,115,0.8)" }}
                                        >
                                            View all {reviews.length} →
                                        </button>
                                    </div>
                                    {/* Show only the first review on About tab */}
                                    {(() => {
                                        const r = reviews[0];
                                        return (
                                            <div className="px-6 py-6 rounded-xl border border-white/5 bg-black/20">
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div
                                                            className="w-12 h-12 rounded-full flex items-center justify-center text-[15px] font-black text-white shrink-0 border border-white/10 shadow-[0_0_15px_rgba(29,191,115,0.2)]"
                                                            style={{ background: "linear-gradient(135deg, #1DBF73, #158a53)" }}
                                                        >
                                                            {r.reviewer.slice(2, 4).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-[15px] font-bold text-white">
                                                                {r.reviewer.slice(0, 6)}…{r.reviewer.slice(-4)}
                                                            </p>
                                                            <p className="text-[12px] font-bold uppercase tracking-widest mt-1 text-white/40">{r.reviewer_role}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <StarRow rating={r.rating} />
                                                        <span className="text-[11px] font-bold text-white/30 tracking-widest uppercase">
                                                            {new Date(r.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                {r.comment && (
                                                    <p className="text-[15px] leading-relaxed font-light italic text-white/80 border-l-2 border-[#1DBF73]/50 pl-4">
                                                        &quot;{r.comment}&quot;
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ACTIVITY tab */}
                {activeTab === "activity" && (
                    <div className="flex flex-col gap-6">

                        {/* ── Stat chips row ─────────────────────────────────── */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: "Contributions", value: String(totalActivity), variant: "dark" as const },
                                { label: "Active Days", value: String(activeDays), variant: "teal" as const },
                                { label: "Current Streak", value: `${currentStreak}d`, variant: currentStreak > 0 ? "amber" as const : "dark" as const },
                                { label: "Longest Streak", value: `${longestStreak}d`, variant: "purple" as const },
                            ].map((s) => (
                                <StatCard key={s.label} value={s.value} label={s.label} variant={s.variant} />
                            ))}
                        </div>

                        {/* ── Grid card ───────────────────────────────────────── */}
                        <div
                            className="relative rounded-[2rem] overflow-hidden backdrop-blur-xl border border-white/10"
                            style={{ background: "rgba(10,15,30,0.6)", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}
                        >
                            {/* Bg glow */}
                            <div className="absolute top-0 right-0 w-[500px] h-[300px] pointer-events-none" style={{ background: "radial-gradient(circle, rgba(29,191,115,0.08), transparent 70%)", transform: "translate(20%, -20%)" }} />
                            <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1.5px, transparent 0)", backgroundSize: "20px 20px" }} />

                            <div className="relative p-8 overflow-x-auto">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-8 flex-wrap gap-4 border-b border-white/5 pb-6">
                                    <div>
                                        <p className="text-[20px] font-bold text-white tracking-tight">
                                            On-chain Activity
                                        </p>
                                        <p className="text-[13px] font-medium mt-1 text-white/40">
                                            {totalActivity} contributions in the last 12 months
                                        </p>
                                    </div>
                                    {busiestCell?.count > 0 && (
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest border border-[#1DBF73]/20" style={{ background: "rgba(29,191,115,0.1)", color: "#1DBF73" }}>
                                            <span className="w-2 h-2 rounded-full bg-[#1DBF73] inline-block shadow-[0_0_8px_#1DBF73]" />
                                            Busiest: {new Date(busiestCell.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {busiestCell.count} tx
                                        </div>
                                    )}
                                </div>

                                {/* Grid */}
                                <div ref={gridRef} className="relative mt-4">
                                    {/* Tooltip */}
                                    {hoveredCell && (
                                        <div
                                            className="pointer-events-none fixed z-50 px-4 py-3 rounded-xl text-[13px] font-bold shadow-[0_10px_30px_rgba(0,0,0,1)] flex flex-col items-center backdrop-blur-2xl border border-white/10"
                                            style={{
                                                background: "rgba(10,10,15,0.9)",
                                                left: hoveredCell.x,
                                                top: hoveredCell.y - 48,
                                                transform: "translateX(-50%)",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            <span style={{ color: "#1DBF73" }}>{hoveredCell.count} contribution{hoveredCell.count !== 1 ? "s" : ""}</span>
                                            <span className="mt-1 font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
                                                {new Date(hoveredCell.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                            </span>
                                        </div>
                                    )}

                                    {/* Month labels */}
                                    <div className="flex gap-[4px] mb-2 pl-8">
                                        {grid.map((week, wi) => {
                                            const found = monthLabels.find((m) => m.weekIndex === wi);
                                            return (
                                                <div key={wi} className="w-[14px] shrink-0 text-[10px] font-bold uppercase tracking-wider text-white/30">
                                                    {found ? found.label : ""}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="flex gap-[4px]">
                                        {/* Day labels */}
                                        <div className="flex flex-col gap-[4px] mr-2 justify-between">
                                            {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                                                <div key={i} className="h-[14px] text-[10px] font-bold uppercase tracking-wider leading-[14px] w-6 text-right text-white/30">{d}</div>
                                            ))}
                                        </div>

                                        {/* Cells */}
                                        <div className="flex gap-[4px]">
                                            {grid.map((week, wi) => (
                                                <div key={wi} className="flex flex-col gap-[4px]">
                                                    {week.map((cell, di) => (
                                                        <div
                                                            key={di}
                                                            className="hcell w-[14px] h-[14px] rounded-[3px] transition-all duration-150"
                                                            style={{
                                                                background: cell.count === 0
                                                                    ? "rgba(255,255,255,0.03)"
                                                                    : getCellBg(cell.count),
                                                                cursor: cell.count > 0 ? "pointer" : "default",
                                                                boxShadow: cell.count > 2 ? "0 0 10px rgba(29,191,115,0.6)" : "inset 0 1px 1px rgba(255,255,255,0.05)",
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                                                setHoveredCell({ date: cell.date, count: cell.count, x: rect.left + rect.width / 2, y: rect.top });
                                                                (e.currentTarget as HTMLElement).style.transform = "scale(1.8)";
                                                                (e.currentTarget as HTMLElement).style.zIndex = "10";
                                                                if (cell.count > 0) {
                                                                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px #1DBF73";
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                setHoveredCell(null);
                                                                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                                                                (e.currentTarget as HTMLElement).style.zIndex = "auto";
                                                                if (cell.count > 0) {
                                                                    (e.currentTarget as HTMLElement).style.boxShadow = cell.count > 2 ? "0 0 10px rgba(29,191,115,0.6)" : "inset 0 1px 1px rgba(255,255,255,0.05)";
                                                                }
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Legend */}
                                    <div className="flex items-center justify-end gap-2 mt-8">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Less</span>
                                        {[0, 1, 2, 3, 4].map((lvl) => (
                                            <div
                                                key={lvl}
                                                className="w-[14px] h-[14px] rounded-[3px]"
                                                style={{
                                                    background: lvl === 0 ? "rgba(255,255,255,0.03)" : getCellBg(lvl),
                                                    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05)",
                                                }}
                                            />
                                        ))}
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">More</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* JOBS tab */}
                {activeTab === "jobs" && (
                    <div
                        className="p-8 rounded-[2rem] backdrop-blur-xl border border-white/10"
                        style={{ background: "rgba(255,255,255,0.02)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
                    >
                        <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center border border-[#1DBF73]/20" style={{ background: "rgba(29,191,115,0.1)" }}>
                                <Briefcase className="w-5 h-5 text-[#1DBF73]" />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">All Jobs</h2>
                            <span className="text-[13px] font-bold text-[#1DBF73] ml-2">({jobs.length})</span>
                        </div>
                        {jobs.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-[15px] font-light text-white/40">No jobs yet.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {jobs.map((job) => {
                                    const s = JOB_STATUS[job.status] ?? JOB_STATUS.OPEN;
                                    return (
                                        <Link key={job.id} href={`/jobs/${job.id}`}
                                            className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 rounded-xl transition-all duration-300 group hover:-translate-y-1 backdrop-blur-md"
                                            style={{ border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}
                                        >
                                            <span
                                                className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded border self-start sm:self-auto shrink-0"
                                                style={{ background: s.bg, color: s.color, borderColor: s.border }}
                                            >
                                                {s.label}
                                            </span>
                                            <span className="flex-1 text-[15px] font-bold truncate text-white/80 group-hover:text-white transition-colors">
                                                {job.title}
                                            </span>
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-white/30 shrink-0">
                                                {new Date(job.created_at).toLocaleDateString()}
                                            </span>
                                            <div className="hidden sm:flex w-8 h-8 rounded-full bg-white/5 items-center justify-center group-hover:bg-[#1DBF73] transition-colors border border-white/10">
                                                <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* REVIEWS tab */}
                {activeTab === "reviews" && (
                    <div
                        className="p-8 rounded-[2rem] backdrop-blur-xl border border-white/10"
                        style={{ background: "rgba(255,255,255,0.02)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
                    >
                        <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center border border-amber-500/20" style={{ background: "rgba(245,158,11,0.1)" }}>
                                <Award className="w-5 h-5 text-amber-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Reviews</h2>
                            {reviews.length > 0 && <span className="text-[13px] font-bold text-amber-500 ml-2">({reviews.length})</span>}
                        </div>
                        {reviews.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-[15px] font-light text-white/40">No reviews yet.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {reviews.map((r) => (
                                    <div
                                        key={r.id}
                                        className="px-6 py-6 rounded-2xl transition-all duration-300 hover:bg-white/5 border border-white/5 bg-black/20"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="w-12 h-12 rounded-full flex items-center justify-center text-[15px] font-black text-white shrink-0 border border-white/10 shadow-[0_0_15px_rgba(29,191,115,0.2)]"
                                                    style={{ background: "linear-gradient(135deg, #1DBF73, #158a53)" }}
                                                >
                                                    {r.reviewer.slice(2, 4).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-[15px] font-bold text-white">
                                                        {r.reviewer.slice(0, 6)}…{r.reviewer.slice(-4)}
                                                    </p>
                                                    <p className="text-[11px] font-bold uppercase tracking-widest mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                                                        {r.reviewer_role}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-start sm:items-end gap-2">
                                                <StarRow rating={r.rating} />
                                                <span className="text-[11px] font-bold uppercase tracking-widest text-white/30">
                                                    {new Date(r.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        {r.comment && (
                                            <p className="text-[15px] leading-relaxed font-light italic text-white/80 border-l-2 border-[#1DBF73]/50 pl-4 py-1">
                                                &quot;{r.comment}&quot;
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <LandingFooter />
        </div>
    );
}
