"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAccount } from "wagmi";
import { supabase } from "@/lib/supabase";
import { formatUSDC } from "@/lib/utils";
import { Star, Globe, Twitter, Github, Edit3, Briefcase, Award, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import LandingFooter from "@/components/landing/LandingFooter";

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
    total_jobs_completed: number;
    avg_rating: number;
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
    deadline: number;
};

function StarRating({ rating }: { rating: number }) {
    return (
        <div style={{ display: "flex", gap: 3 }}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4" style={{
                    width: 15, height: 15,
                    fill: i <= rating ? "#fbbf24" : "transparent",
                    color: i <= rating ? "#fbbf24" : "var(--text-subtle)",
                }} />
            ))}
        </div>
    );
}

export default function ProfilePage() {
    const { address: walletAddress } = useParams<{ address: string }>();
    const { address: myAddress } = useAccount();
    const isOwn = myAddress?.toLowerCase() === walletAddress?.toLowerCase();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!walletAddress) return;
        const addr = walletAddress.toLowerCase();

        Promise.all([
            supabase.from("profiles").select("*").eq("wallet", addr).single(),
            supabase.from("reviews").select("*").eq("reviewee", addr).order("created_at", { ascending: false }).limit(10),
            supabase.from("jobs").select("id,title,amount,status,deadline").eq("freelancer", addr).eq("status", "APPROVED").order("created_at", { ascending: false }).limit(5),
        ]).then(([p, r, j]) => {
            setProfile(p.data as Profile | null);
            setReviews((r.data as Review[]) || []);
            setJobs((j.data as Job[]) || []);
            setLoading(false);
        });
    }, [walletAddress]);

    const avatarInitials = profile?.display_name
        ? profile.display_name.substring(0, 2).toUpperCase()
        : walletAddress?.substring(2, 4).toUpperCase() ?? "??";

    return (
        <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
            <Navbar />
            <div className="noise-overlay" aria-hidden="true" />

            <main className="container-custom pt-32 pb-24">
                {loading ? (
                    <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>Loading profile…</div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 28, alignItems: "start" }}>
                        {/* Left sidebar */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {/* Avatar card */}
                            <div className="minimal-card" style={{ textAlign: "center", padding: 32 }}>
                                {/* Avatar */}
                                <div style={{
                                    width: 80, height: 80,
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.8rem",
                                    fontWeight: 800,
                                    color: "white",
                                    margin: "0 auto 16px",
                                    border: "3px solid rgba(107,93,211,0.3)",
                                }}>
                                    {avatarInitials}
                                </div>

                                <h1 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "1.3rem", color: "var(--text)", marginBottom: 4 }}>
                                    {profile?.display_name || `${walletAddress?.slice(0, 6)}…${walletAddress?.slice(-4)}`}
                                </h1>

                                {profile?.title && (
                                    <p style={{ color: "var(--accent-light)", fontSize: "0.85rem", fontWeight: 500, marginBottom: 12 }}>{profile.title}</p>
                                )}

                                {profile && profile.avg_rating > 0 && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 16 }}>
                                        <StarRating rating={Math.round(profile.avg_rating)} />
                                        <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                                            {profile.avg_rating.toFixed(1)} ({reviews.length} reviews)
                                        </span>
                                    </div>
                                )}

                                {/* Stats */}
                                <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 20 }}>
                                    <div style={{ textAlign: "center" }}>
                                        <div style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "1.3rem", color: "var(--text)" }}>
                                            {profile?.total_jobs_completed || jobs.length}
                                        </div>
                                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Jobs Done</div>
                                    </div>
                                </div>

                                {/* Edit profile (own) */}
                                {isOwn && (
                                    <Link href="/profile/edit" className="btn-magnetic btn-ghost" style={{ display: "inline-flex", width: "100%", justifyContent: "center", fontSize: "0.85rem" }}>
                                        <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                                    </Link>
                                )}
                            </div>

                            {/* Bio */}
                            {profile?.bio && (
                                <div className="minimal-card" style={{ textAlign: "left" }}>
                                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>About</p>
                                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.7 }}>{profile.bio}</p>
                                </div>
                            )}

                            {/* Skills */}
                            {(profile?.skills || []).length > 0 && (
                                <div className="minimal-card" style={{ textAlign: "left" }}>
                                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>Skills</p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                        {profile?.skills.map((s) => (
                                            <span key={s} style={{ padding: "4px 12px", borderRadius: 50, background: "var(--accent-dim)", border: "1px solid rgba(107,93,211,0.2)", fontSize: "0.78rem", color: "var(--accent-light)", fontWeight: 500 }}>
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Socials */}
                            {(profile?.website || profile?.twitter || profile?.github) && (
                                <div className="minimal-card" style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 10 }}>
                                    {profile?.website && <a href={profile.website} target="_blank" rel="noopener" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: "0.85rem" }}><Globe className="w-4 h-4" style={{ color: "var(--accent-light)" }} />Website</a>}
                                    {profile?.twitter && <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: "0.85rem" }}><Twitter className="w-4 h-4" style={{ color: "var(--accent-light)" }} />@{profile.twitter}</a>}
                                    {profile?.github && <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: "0.85rem" }}><Github className="w-4 h-4" style={{ color: "var(--accent-light)" }} />{profile.github}</a>}
                                </div>
                            )}
                        </div>

                        {/* Right main */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                            {/* Completed Jobs */}
                            {jobs.length > 0 && (
                                <div>
                                    <h2 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "1.2rem", color: "var(--text)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                                        <Briefcase className="w-5 h-5" style={{ color: "var(--accent-light)" }} /> Completed Jobs
                                    </h2>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                        {jobs.map((job) => (
                                            <Link key={job.id} href={`/jobs/${job.id}`} style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 14,
                                                padding: "16px 20px",
                                                background: "var(--bg-2)",
                                                border: "1px solid var(--border)",
                                                borderRadius: 14,
                                                textDecoration: "none",
                                                transition: "border-color 0.3s",
                                            }}>
                                                <div style={{ flex: 1, fontWeight: 600, color: "var(--text)", fontSize: "0.92rem" }}>{job.title}</div>
                                                <span style={{ fontFamily: "Space Grotesk", fontWeight: 700, color: "var(--text)", fontSize: "0.9rem", whiteSpace: "nowrap" }}>
                                                    ${formatUSDC(BigInt(job.amount))} USDC
                                                </span>
                                                <ArrowRight className="w-4 h-4" style={{ color: "var(--text-subtle)", flexShrink: 0 }} />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Reviews */}
                            <div>
                                <h2 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "1.2rem", color: "var(--text)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                                    <Award className="w-5 h-5" style={{ color: "var(--accent-light)" }} /> Reviews
                                    {reviews.length > 0 && <span style={{ fontFamily: "mono", fontWeight: 400, fontSize: "0.82rem", color: "var(--text-muted)" }}>({reviews.length})</span>}
                                </h2>
                                {reviews.length === 0 ? (
                                    <div className="minimal-card" style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)", fontSize: "0.88rem" }}>
                                        No reviews yet.
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                        {reviews.map((r) => (
                                            <div key={r.id} className="minimal-card" style={{ textAlign: "left" }}>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                        <div style={{
                                                            width: 32, height: 32,
                                                            borderRadius: "50%",
                                                            background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontSize: "0.72rem",
                                                            fontWeight: 700,
                                                            color: "white",
                                                        }}>
                                                            {r.reviewer.substring(2, 4).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: "0.83rem", fontWeight: 600, color: "var(--text)" }}>{r.reviewer.slice(0, 6)}…{r.reviewer.slice(-4)}</div>
                                                            <div style={{ fontSize: "0.72rem", color: "var(--text-subtle)" }}>
                                                                {r.reviewer_role === "client" ? "Client" : "Freelancer"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <StarRating rating={r.rating} />
                                                </div>
                                                {r.comment && <p style={{ fontSize: "0.87rem", color: "var(--text-muted)", lineHeight: 1.65, fontStyle: "italic" }}>&quot;{r.comment}&quot;</p>}
                                                <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginTop: 8 }}>{new Date(r.created_at).toLocaleDateString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <LandingFooter />
        </div>
    );
}
