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
} from "lucide-react";

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

function getCellColor(count: number) {
    if (count === 0) return "rgba(255,255,255,0.04)";
    if (count === 1) return "rgba(99,102,241,0.35)";
    if (count === 2) return "rgba(99,102,241,0.55)";
    if (count === 3) return "rgba(99,102,241,0.75)";
    return "#6366f1";
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRow({ rating }: { rating: number }) {
    return (
        <div style={{ display: "flex", gap: 2 }}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} style={{ width: 13, height: 13, fill: i <= rating ? "#fbbf24" : "transparent", color: i <= rating ? "#fbbf24" : "#333" }} />
            ))}
        </div>
    );
}

function StatBox({ value, label }: { value: string; label: string }) {
    return (
        <div style={{ textAlign: "center", padding: "16px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14 }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f0f0f5", fontFamily: "Space Grotesk, sans-serif", lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: "0.72rem", color: "#8888a0", marginTop: 6, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
    const { address: walletAddress } = useParams<{ address: string }>();
    const { address: myAddress } = useAccount();
    const isOwn = myAddress?.toLowerCase() === walletAddress?.toLowerCase();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [activityDates, setActivityDates] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const heroRef = useRef<HTMLDivElement>(null);
    const avatarRef = useRef<HTMLDivElement>(null);
    const nameRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLDivElement>(null);

    // ── Fetch ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!walletAddress) return;
        const addr = walletAddress.toLowerCase();
        Promise.all([
            supabase.from("profiles").select("*").eq("wallet", addr).single(),
            supabase.from("reviews").select("*").eq("reviewee", addr).order("created_at", { ascending: false }).limit(20),
            supabase.from("jobs").select("id,title,amount,status,created_at").or(`client.eq.${addr},freelancer.eq.${addr}`).neq("status", "CANCELLED").order("created_at", { ascending: false }).limit(8),
        ]).then(([p, r, j]) => {
            setProfile(p.data as Profile | null);
            setReviews((r.data as Review[]) || []);
            const allJobs = (j.data as Job[]) || [];
            setJobs(allJobs);
            setActivityDates(allJobs.map((jb) => jb.created_at));
            setLoading(false);
        });
    }, [walletAddress]);

    // ── GSAP ───────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (loading) return;
        let cleanup: (() => void) | undefined;

        import("gsap").then(({ gsap }) =>
            import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
                gsap.registerPlugin(ScrollTrigger);
                const ctx = gsap.context(() => {
                    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

                    if (avatarRef.current)
                        tl.from(avatarRef.current, { scale: 0.5, opacity: 0, duration: 0.7 });
                    if (nameRef.current)
                        tl.from(nameRef.current.children, { y: 24, opacity: 0, stagger: 0.08, duration: 0.6 }, "-=0.4");
                    if (statsRef.current)
                        tl.from(statsRef.current.children, { y: 20, opacity: 0, stagger: 0.1, duration: 0.5 }, "-=0.3");

                    if (gridRef.current) {
                        const cells = gridRef.current.querySelectorAll(".hcell");
                        gsap.from(cells, {
                            opacity: 0, scale: 0.3,
                            stagger: { amount: 1.4, from: "start" },
                            ease: "power2.out", duration: 0.3,
                            scrollTrigger: { trigger: gridRef.current, start: "top 85%" },
                        });
                    }

                    if (sidebarRef.current)
                        gsap.from(sidebarRef.current.children, { x: -28, opacity: 0, stagger: 0.12, duration: 0.6, ease: "power2.out", scrollTrigger: { trigger: sidebarRef.current, start: "top 80%" } });

                    if (mainRef.current)
                        gsap.from(mainRef.current.children, { y: 28, opacity: 0, stagger: 0.14, duration: 0.6, ease: "power2.out", scrollTrigger: { trigger: mainRef.current, start: "top 80%" } });
                });
                cleanup = () => ctx.revert();
            })
        );

        return () => cleanup?.();
    }, [loading]);

    // ── Derived ────────────────────────────────────────────────────────────────
    const initials = profile?.display_name ? profile.display_name.slice(0, 2).toUpperCase() : walletAddress?.slice(2, 4).toUpperCase() ?? "??";
    const shortAddr = walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : "";
    const displayName = profile?.display_name || shortAddr;
    const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—";
    const grid = buildActivityGrid(activityDates);
    const monthLabels = getMonthLabels(grid);
    const totalActivity = activityDates.length;
    const roleLabel = profile?.role === "client" ? "Client" : profile?.role === "both" ? "Client & Freelancer" : "Freelancer";
    const expLabel = profile?.experience_level ? profile.experience_level.charAt(0).toUpperCase() + profile.experience_level.slice(1) : null;

    // ── Loading ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div style={{ background: "#0a0a0f", minHeight: "100vh" }}>
                <Navbar />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "70vh" }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid #6366f1", borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                        <p style={{ color: "#8888a0", fontSize: "0.88rem" }}>Loading profile…</p>
                        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    </div>
                </div>
            </div>
        );
    }

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div style={{ background: "#0a0a0f", minHeight: "100vh", color: "#f0f0f5" }}>
            <Navbar />

            {/* ── Hero Banner ───────────────────────────────────────────────── */}
            <div ref={heroRef} style={{ position: "relative", overflow: "hidden", background: "linear-gradient(180deg, rgba(99,102,241,0.07) 0%, transparent 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)", backgroundSize: "44px 44px", pointerEvents: "none" }} />

                <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px 48px" }}>

                    {/* Avatar + name */}
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 28, flexWrap: "wrap", marginBottom: 36 }}>
                        <div ref={avatarRef} style={{ position: "relative", flexShrink: 0 }}>
                            {profile?.avatar_url ? (
                                <Image src={profile.avatar_url!} width={120} height={120} alt={displayName} style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", border: "4px solid rgba(99,102,241,0.45)", boxShadow: "0 0 40px rgba(99,102,241,0.3)" }} />
                            ) : (
                                <div style={{ width: 120, height: 120, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.8rem", fontWeight: 800, color: "#fff", border: "4px solid rgba(99,102,241,0.45)", boxShadow: "0 0 40px rgba(99,102,241,0.3)", fontFamily: "Space Grotesk,sans-serif" }}>
                                    {initials}
                                </div>
                            )}
                            <div style={{ position: "absolute", bottom: 6, right: 6, width: 16, height: 16, borderRadius: "50%", background: "#34d399", border: "3px solid #0a0a0f" }} />
                        </div>

                        <div ref={nameRef} style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                                <h1 style={{ fontFamily: "Space Grotesk,sans-serif", fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 700, color: "#f0f0f5", margin: 0, letterSpacing: "-0.02em" }}>
                                    {displayName}
                                </h1>
                                {isOwn && (
                                    <Link href="/profile/edit" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 99, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "#8888a0", fontSize: "0.8rem", fontWeight: 600, textDecoration: "none" }}>
                                        <Edit3 style={{ width: 12, height: 12 }} /> Edit
                                    </Link>
                                )}
                            </div>

                            {profile?.title && <p style={{ color: "#818cf8", fontSize: "1rem", fontWeight: 500, margin: "6px 0 0" }}>{profile.title}</p>}

                            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
                                {profile?.location && <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#8888a0", fontSize: "0.82rem" }}><MapPin style={{ width: 13, height: 13 }} />{profile.location}</span>}
                                <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#8888a0", fontSize: "0.82rem" }}><Calendar style={{ width: 13, height: 13 }} />Member since {memberSince}</span>
                                {expLabel && <span style={{ padding: "3px 10px", borderRadius: 99, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8", fontSize: "0.75rem", fontWeight: 600 }}>{expLabel}</span>}
                                <span style={{ padding: "3px 10px", borderRadius: 99, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399", fontSize: "0.75rem", fontWeight: 600 }}>{roleLabel}</span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
                                {profile?.github && <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener" style={{ display: "flex", alignItems: "center", gap: 6, color: "#8888a0", fontSize: "0.82rem", textDecoration: "none" }}><Github style={{ width: 15, height: 15 }} />{profile.github}</a>}
                                {profile?.twitter && <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener" style={{ display: "flex", alignItems: "center", gap: 6, color: "#8888a0", fontSize: "0.82rem", textDecoration: "none" }}><Twitter style={{ width: 15, height: 15 }} />@{profile.twitter}</a>}
                                {profile?.website && <a href={profile.website} target="_blank" rel="noopener" style={{ display: "flex", alignItems: "center", gap: 6, color: "#8888a0", fontSize: "0.82rem", textDecoration: "none" }}><Globe style={{ width: 15, height: 15 }} />Website</a>}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div ref={statsRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12 }}>
                        <StatBox value={String(profile?.total_jobs_completed || 0)} label="Jobs Completed" />
                        <StatBox value={profile?.avg_rating ? profile.avg_rating.toFixed(1) : "—"} label="Avg Rating" />
                        <StatBox value={String(totalActivity)} label="Total Activity" />
                        {profile?.hourly_rate ? <StatBox value={`$${profile.hourly_rate}/hr`} label="Hourly Rate" /> : null}
                        {reviews.length > 0 ? <StatBox value={String(reviews.length)} label="Reviews" /> : null}
                    </div>
                </div>
            </div>

            {/* ── Body ──────────────────────────────────────────────────────── */}
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px 80px", display: "grid", gridTemplateColumns: "260px 1fr", gap: 24, alignItems: "start" }}>

                {/* ── Left Sidebar ──────────────────────────────────────────── */}
                <div ref={sidebarRef} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                    {profile?.bio && (
                        <div style={{ padding: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
                            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>About</p>
                            <p style={{ fontSize: "0.87rem", color: "#9090a8", lineHeight: 1.7, margin: 0 }}>{profile.bio}</p>
                        </div>
                    )}

                    {(profile?.skills || []).length > 0 && (
                        <div style={{ padding: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
                            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Skills</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                                {profile?.skills.map((s) => (
                                    <span key={s} style={{ padding: "4px 11px", borderRadius: 99, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.22)", fontSize: "0.75rem", color: "#818cf8", fontWeight: 600 }}>{s}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ padding: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
                        <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Wallet</p>
                        <p style={{ fontSize: "0.72rem", color: "#8888a0", fontFamily: "monospace", wordBreak: "break-all", margin: 0 }}>{walletAddress}</p>
                        <a href={`https://polygonscan.com/address/${walletAddress}`} target="_blank" rel="noopener" style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10, fontSize: "0.74rem", color: "#6366f1", textDecoration: "none" }}>
                            <ExternalLink style={{ width: 11, height: 11 }} />View on Polygonscan
                        </a>
                    </div>
                </div>

                {/* ── Right Main ────────────────────────────────────────────── */}
                <div ref={mainRef} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                    {/* Activity Heatmap */}
                    <div style={{ padding: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflowX: "auto" }}>
                        <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#f0f0f5", marginBottom: 18 }}>
                            {totalActivity} contributions in the last year
                        </p>

                        <div ref={gridRef}>
                            {/* Month labels */}
                            <div style={{ display: "flex", gap: 3, marginBottom: 4, paddingLeft: 20 }}>
                                {grid.map((week, wi) => {
                                    const found = monthLabels.find((m) => m.weekIndex === wi);
                                    return <div key={wi} style={{ width: 12, flexShrink: 0, fontSize: "0.62rem", color: "#555" }}>{found ? found.label : ""}</div>;
                                })}
                            </div>

                            <div style={{ display: "flex", gap: 4 }}>
                                {/* Day labels */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                    {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                                        <div key={i} style={{ height: 12, fontSize: "0.59rem", color: "#555", lineHeight: "12px", width: 16, textAlign: "right" }}>{d}</div>
                                    ))}
                                </div>

                                {/* Cells */}
                                <div style={{ display: "flex", gap: 3 }}>
                                    {grid.map((week, wi) => (
                                        <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                            {week.map((cell, di) => (
                                                <div
                                                    key={di}
                                                    className="hcell"
                                                    title={`${cell.date}: ${cell.count} contribution${cell.count !== 1 ? "s" : ""}`}
                                                    style={{ width: 12, height: 12, borderRadius: 2, background: getCellColor(cell.count), border: "1px solid rgba(255,255,255,0.03)", transition: "transform 0.15s", cursor: cell.count > 0 ? "pointer" : "default" }}
                                                    onMouseEnter={(e) => { if (cell.count > 0) (e.currentTarget as HTMLElement).style.transform = "scale(1.5)"; }}
                                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Legend */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5, marginTop: 10 }}>
                                <span style={{ fontSize: "0.62rem", color: "#555" }}>Less</span>
                                {[0, 1, 2, 3, 4].map((lvl) => (
                                    <div key={lvl} style={{ width: 10, height: 10, borderRadius: 2, background: getCellColor(lvl) }} />
                                ))}
                                <span style={{ fontSize: "0.62rem", color: "#555" }}>More</span>
                            </div>
                        </div>
                    </div>

                    {/* Jobs */}
                    {jobs.length > 0 && (
                        <div style={{ padding: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                                <Briefcase style={{ width: 15, height: 15, color: "#6366f1" }} />
                                <h2 style={{ fontFamily: "Space Grotesk,sans-serif", fontWeight: 700, fontSize: "0.92rem", color: "#f0f0f5", margin: 0 }}>Jobs</h2>
                                <span style={{ fontSize: "0.72rem", color: "#555" }}>({jobs.length})</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {jobs.map((job) => (
                                    <Link key={job.id} href={`/jobs/${job.id}`}
                                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, textDecoration: "none", transition: "border-color 0.2s,background 0.2s" }}
                                        onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(99,102,241,0.4)"; el.style.background = "rgba(99,102,241,0.05)"; }}
                                        onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,255,255,0.06)"; el.style.background = "rgba(255,255,255,0.02)"; }}>
                                        <CheckCircle2 style={{ width: 14, height: 14, color: job.status === "APPROVED" ? "#34d399" : "#6366f1", flexShrink: 0 }} />
                                        <span style={{ flex: 1, fontSize: "0.86rem", fontWeight: 500, color: "#d0d0e0" }}>{job.title}</span>
                                        <span style={{ fontSize: "0.72rem", padding: "3px 10px", borderRadius: 99, background: job.status === "APPROVED" ? "rgba(52,211,153,0.1)" : "rgba(99,102,241,0.1)", color: job.status === "APPROVED" ? "#34d399" : "#818cf8", fontWeight: 600 }}>
                                            {job.status}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reviews */}
                    <div style={{ padding: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                            <Award style={{ width: 15, height: 15, color: "#6366f1" }} />
                            <h2 style={{ fontFamily: "Space Grotesk,sans-serif", fontWeight: 700, fontSize: "0.92rem", color: "#f0f0f5", margin: 0 }}>Reviews</h2>
                            {reviews.length > 0 && <span style={{ fontSize: "0.72rem", color: "#555" }}>({reviews.length})</span>}
                        </div>

                        {reviews.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "32px 0", color: "#555", fontSize: "0.85rem" }}>No reviews yet.</div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {reviews.map((r) => (
                                    <div key={r.id} style={{ padding: "16px 18px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
                                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                                                    {r.reviewer.slice(2, 4).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#d0d0e0", margin: 0 }}>{r.reviewer.slice(0, 6)}…{r.reviewer.slice(-4)}</p>
                                                    <p style={{ fontSize: "0.7rem", color: "#555", marginTop: 2, textTransform: "capitalize" }}>{r.reviewer_role}</p>
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                                                <StarRow rating={r.rating} />
                                                <span style={{ fontSize: "0.68rem", color: "#555" }}>{new Date(r.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        {r.comment && <p style={{ fontSize: "0.85rem", color: "#9090a8", lineHeight: 1.65, fontStyle: "italic", margin: 0 }}>&quot;{r.comment}&quot;</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <LandingFooter />
        </div>
    );
}
