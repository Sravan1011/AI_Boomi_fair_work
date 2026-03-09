"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import {
    Briefcase, Code2, Layers, ChevronRight, ChevronLeft,
    Check, Plus, X, MapPin, Globe, Github, Twitter,
    DollarSign, Award, User, FileText,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const SKILLS = [
    "Solidity", "EVM", "Foundry", "Hardhat", "DeFi", "NFT", "Smart Contracts",
    "React", "Next.js", "TypeScript", "Node.js", "Python", "Rust", "Go",
    "AI/ML", "Web3.js", "Ethers.js", "Wagmi", "IPFS", "Filecoin",
    "Auditing", "Security", "Frontend", "Backend", "Full-Stack",
    "UI/UX", "Design", "Technical Writing", "Documentation",
];

const EXPERIENCE_LEVELS = [
    { value: "entry", label: "Entry Level", desc: "Just starting out, building my portfolio" },
    { value: "intermediate", label: "Intermediate", desc: "1–3 years of professional experience" },
    { value: "expert", label: "Expert", desc: "3+ years, seasoned professional" },
];

const TOTAL_STEPS = 4;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const StepDot = ({ index, current }: { index: number; current: number }) => (
    <div className="flex items-center gap-2">
        <div
            style={{
                width: 28, height: 28, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.75rem", fontWeight: 700,
                background: index < current
                    ? "var(--accent)"
                    : index === current
                        ? "linear-gradient(135deg, #6366f1, #7c3aed)"
                        : "rgba(255,255,255,0.05)",
                border: index === current
                    ? "2px solid #6366f1"
                    : index < current
                        ? "2px solid var(--accent)"
                        : "2px solid rgba(255,255,255,0.1)",
                color: index <= current ? "#fff" : "#666",
                transition: "all 0.3s",
            }}
        >
            {index < current ? <Check className="w-3.5 h-3.5" /> : index + 1}
        </div>
        {index < TOTAL_STEPS - 1 && (
            <div style={{
                height: 2, width: 40,
                background: index < current
                    ? "linear-gradient(90deg, #6366f1, #7c3aed)"
                    : "rgba(255,255,255,0.08)",
                borderRadius: 99, transition: "all 0.3s",
            }} />
        )}
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RegisterPage() {
    const { address, isConnected } = useAccount();
    const router = useRouter();

    const [step, setStep] = useState(0);       // 0 = wallet, 1-4 = form steps
    const [saving, setSaving] = useState(false);
    const [checking, setChecking] = useState(true);

    const [form, setForm] = useState({
        role: "" as "client" | "freelancer" | "both" | "",
        display_name: "",
        title: "",
        bio: "",
        location: "",
        skills: [] as string[],
        experience_level: "" as "entry" | "intermediate" | "expert" | "",
        hourly_rate: "",
        website: "",
        github: "",
        twitter: "",
    });

    // Check if already registered → skip to jobs
    useEffect(() => {
        if (!isConnected || !address) {
            setChecking(false);
            return;
        }
        supabase
            .from("profiles")
            .select("wallet, is_registered")
            .eq("wallet", address.toLowerCase())
            .single()
            .then(({ data }) => {
                if (data?.is_registered) {
                    router.replace("/jobs");
                } else {
                    setStep(1);   // wallet connected, go to step 1
                    setChecking(false);
                }
            });
    }, [isConnected, address, router]);

    // When wallet connects mid-flow
    useEffect(() => {
        if (isConnected && step === 0) setStep(1);
    }, [isConnected, step]);

    const toggleSkill = (skill: string) => {
        setForm((f) => ({
            ...f,
            skills: f.skills.includes(skill)
                ? f.skills.filter((s) => s !== skill)
                : f.skills.length < 10 ? [...f.skills, skill] : f.skills,
        }));
    };

    const handleFinish = async () => {
        if (!address) return;
        setSaving(true);
        await supabase.from("profiles").upsert({
            wallet: address.toLowerCase(),
            role: form.role || "freelancer",
            display_name: form.display_name,
            title: form.title,
            bio: form.bio,
            location: form.location,
            skills: form.skills,
            experience_level: form.experience_level || null,
            hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : null,
            website: form.website,
            github: form.github,
            twitter: form.twitter,
            is_registered: true,
            updated_at: new Date().toISOString(),
        });
        setSaving(false);
        router.push("/jobs");
    };

    // ── Loading state ──────────────────────────────────────────────────────────
    if (checking) {
        return (
            <div style={{ background: "#0a0a0f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid #6366f1", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // ── Layout wrapper ─────────────────────────────────────────────────────────
    return (
        <div style={{ background: "#0a0a0f", minHeight: "100vh" }}>
            <Navbar />

            {/* Glow background */}
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
                <div style={{ position: "absolute", top: "20%", left: "10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)" }} />
                <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)" }} />
            </div>

            <main style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 80, paddingBottom: 80, paddingLeft: 24, paddingRight: 24 }}>

                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 48 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 99, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)", padding: "6px 16px", fontSize: "0.75rem", color: "#818cf8", marginBottom: 20, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#818cf8", animation: "pulse 2s infinite" }} />
                        Create Your Account
                    </div>
                    <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: "#f0f0f5", letterSpacing: "-0.03em", margin: 0 }}>
                        {step === 0 ? "Connect your wallet" : "Set up your profile"}
                    </h1>
                    <p style={{ color: "#8888a0", marginTop: 12, fontSize: "1rem" }}>
                        {step === 0
                            ? "Your wallet is your identity on FairWork."
                            : "Tell the community who you are and what you do."}
                    </p>
                </div>

                {/* Step dots — only show after wallet connected */}
                {step > 0 && (
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 40 }}>
                        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                            <StepDot key={i} index={i} current={step - 1} />
                        ))}
                    </div>
                )}

                {/* Card */}
                <div style={{
                    width: "100%", maxWidth: 640,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 20,
                    padding: "40px 44px",
                    backdropFilter: "blur(12px)",
                }}>

                    {/* ── STEP 0: Connect Wallet ───────────────────────────────── */}
                    {step === 0 && (
                        <div style={{ textAlign: "center" }}>
                            <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(124,58,237,0.2))", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                    <rect x="2" y="5" width="20" height="14" rx="2" stroke="#818cf8" strokeWidth="1.5" />
                                    <path d="M16 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0z" fill="#818cf8" />
                                    <path d="M2 10h20" stroke="#818cf8" strokeWidth="1.5" />
                                </svg>
                            </div>
                            <p style={{ color: "#8888a0", marginBottom: 32, lineHeight: 1.6 }}>
                                No passwords, no emails. Your wallet address is your unique identity — all your jobs, earnings, and reputation are tied to it.
                            </p>
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <ConnectButton label="Connect Wallet to Continue" showBalance={false} accountStatus="address" chainStatus="none" />
                            </div>
                        </div>
                    )}

                    {/* ── STEP 1: Role ─────────────────────────────────────────── */}
                    {step === 1 && (
                        <div>
                            <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#f0f0f5", marginBottom: 8 }}>I want to...</h2>
                            <p style={{ color: "#8888a0", fontSize: "0.9rem", marginBottom: 28 }}>You can always do both. Choose what describes you best.</p>

                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {[
                                    { value: "client", icon: <Briefcase className="w-5 h-5" />, label: "Hire Talent", desc: "Post jobs and find skilled professionals for my Web3 projects." },
                                    { value: "freelancer", icon: <Code2 className="w-5 h-5" />, label: "Find Work", desc: "Offer my skills and get paid securely in USDC via escrow." },
                                    { value: "both", icon: <Layers className="w-5 h-5" />, label: "Both — Hire & Work", desc: "I post jobs AND take on freelance work." },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setForm((f) => ({ ...f, role: opt.value as "client" | "freelancer" | "both" }))}
                                        style={{
                                            display: "flex", alignItems: "flex-start", gap: 16,
                                            padding: "18px 20px", borderRadius: 14, textAlign: "left",
                                            border: form.role === opt.value
                                                ? "1.5px solid #6366f1"
                                                : "1.5px solid rgba(255,255,255,0.07)",
                                            background: form.role === opt.value
                                                ? "rgba(99,102,241,0.1)"
                                                : "rgba(255,255,255,0.02)",
                                            cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit",
                                        }}
                                    >
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                            background: form.role === opt.value ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)",
                                            border: form.role === opt.value ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.08)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            color: form.role === opt.value ? "#818cf8" : "#555",
                                        }}>
                                            {opt.icon}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 700, color: form.role === opt.value ? "#f0f0f5" : "#aaa", fontSize: "0.95rem", margin: 0 }}>{opt.label}</p>
                                            <p style={{ color: "#666", fontSize: "0.82rem", marginTop: 4, lineHeight: 1.5 }}>{opt.desc}</p>
                                        </div>
                                        {form.role === opt.value && (
                                            <div style={{ marginLeft: "auto", width: 22, height: 22, borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <Check className="w-3.5 h-3.5" style={{ color: "#fff" }} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: Basic Info ───────────────────────────────────── */}
                    {step === 2 && (
                        <div>
                            <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#f0f0f5", marginBottom: 8 }}>Basic Information</h2>
                            <p style={{ color: "#8888a0", fontSize: "0.9rem", marginBottom: 28 }}>This is how clients and freelancers will know you.</p>

                            {[
                                { icon: <User className="w-4 h-4" />, label: "Display Name *", key: "display_name", placeholder: "e.g. Alex Rivera", required: true },
                                { icon: <Award className="w-4 h-4" />, label: "Professional Title *", key: "title", placeholder: "e.g. Smart Contract Developer" },
                                { icon: <MapPin className="w-4 h-4" />, label: "Location", key: "location", placeholder: "e.g. San Francisco, CA" },
                            ].map((f) => (
                                <div key={f.key} style={{ marginBottom: 20 }}>
                                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", fontWeight: 600, color: "#8888a0", marginBottom: 8, letterSpacing: "0.04em" }}>
                                        <span style={{ color: "#555" }}>{f.icon}</span> {f.label}
                                    </label>
                                    <input
                                        type="text"
                                        value={form[f.key as keyof typeof form] as string}
                                        onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                                        placeholder={f.placeholder}
                                        style={{
                                            width: "100%", padding: "12px 16px", borderRadius: 10,
                                            background: "rgba(255,255,255,0.04)",
                                            border: "1.5px solid rgba(255,255,255,0.08)",
                                            color: "#f0f0f5", fontSize: "0.92rem", outline: "none",
                                            boxSizing: "border-box", fontFamily: "inherit",
                                            transition: "border-color 0.2s",
                                        }}
                                        onFocus={(e) => { e.target.style.borderColor = "#6366f1"; }}
                                        onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
                                    />
                                </div>
                            ))}

                            {/* Bio */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", fontWeight: 600, color: "#8888a0", marginBottom: 8, letterSpacing: "0.04em" }}>
                                    <FileText className="w-4 h-4" style={{ color: "#555" }} /> Bio *
                                </label>
                                <textarea
                                    value={form.bio}
                                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                                    placeholder="Tell clients about your background, what you specialize in, and what makes you stand out..."
                                    rows={4}
                                    style={{
                                        width: "100%", padding: "12px 16px", borderRadius: 10,
                                        background: "rgba(255,255,255,0.04)",
                                        border: "1.5px solid rgba(255,255,255,0.08)",
                                        color: "#f0f0f5", fontSize: "0.92rem", outline: "none",
                                        resize: "vertical", boxSizing: "border-box", fontFamily: "inherit",
                                        transition: "border-color 0.2s",
                                    }}
                                    onFocus={(e) => { e.target.style.borderColor = "#6366f1"; }}
                                    onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: Skills & Experience ──────────────────────────── */}
                    {step === 3 && (
                        <div>
                            <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#f0f0f5", marginBottom: 8 }}>Skills & Experience</h2>
                            <p style={{ color: "#8888a0", fontSize: "0.9rem", marginBottom: 28 }}>Help clients find you. Select up to 10 skills.</p>

                            {/* Skills picker */}
                            <div style={{ marginBottom: 28 }}>
                                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#8888a0", marginBottom: 10, letterSpacing: "0.04em", display: "block" }}>
                                    Skills <span style={{ color: "#555", fontWeight: 400 }}>({form.skills.length}/10 selected)</span>
                                </label>
                                {form.skills.length > 0 && (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                                        {form.skills.map((s) => (
                                            <button key={s} onClick={() => toggleSkill(s)}
                                                style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 99, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.35)", color: "#818cf8", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                                                {s} <X className="w-3 h-3" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                                    {SKILLS.filter((s) => !form.skills.includes(s)).map((s) => (
                                        <button key={s} onClick={() => toggleSkill(s)}
                                            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 99, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)", color: "#8888a0", fontSize: "0.78rem", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                                            onMouseEnter={(e) => { (e.target as HTMLElement).style.borderColor = "rgba(99,102,241,0.4)"; (e.target as HTMLElement).style.color = "#818cf8"; }}
                                            onMouseLeave={(e) => { (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.target as HTMLElement).style.color = "#8888a0"; }}>
                                            <Plus className="w-3 h-3" /> {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Experience Level */}
                            {(form.role === "freelancer" || form.role === "both") && (
                                <div style={{ marginBottom: 28 }}>
                                    <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#8888a0", marginBottom: 10, letterSpacing: "0.04em", display: "block" }}>Experience Level</label>
                                    <div style={{ display: "flex", gap: 10 }}>
                                        {EXPERIENCE_LEVELS.map((lvl) => (
                                            <button key={lvl.value} onClick={() => setForm((f) => ({ ...f, experience_level: lvl.value as "entry" | "intermediate" | "expert" }))}
                                                style={{
                                                    flex: 1, padding: "12px 8px", borderRadius: 10, textAlign: "center",
                                                    border: form.experience_level === lvl.value ? "1.5px solid #6366f1" : "1.5px solid rgba(255,255,255,0.07)",
                                                    background: form.experience_level === lvl.value ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)",
                                                    cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                                                }}>
                                                <p style={{ fontWeight: 700, color: form.experience_level === lvl.value ? "#f0f0f5" : "#888", fontSize: "0.82rem", margin: 0 }}>{lvl.label}</p>
                                                <p style={{ color: "#555", fontSize: "0.72rem", marginTop: 4, lineHeight: 1.4 }}>{lvl.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Hourly Rate */}
                            {(form.role === "freelancer" || form.role === "both") && (
                                <div>
                                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", fontWeight: 600, color: "#8888a0", marginBottom: 8, letterSpacing: "0.04em" }}>
                                        <DollarSign className="w-4 h-4" style={{ color: "#555" }} /> Hourly Rate (USDC) <span style={{ color: "#555", fontWeight: 400 }}>— optional</span>
                                    </label>
                                    <div style={{ position: "relative" }}>
                                        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#555", fontSize: "0.9rem" }}>$</span>
                                        <input
                                            type="number"
                                            value={form.hourly_rate}
                                            onChange={(e) => setForm((f) => ({ ...f, hourly_rate: e.target.value }))}
                                            placeholder="e.g. 75"
                                            style={{
                                                width: "100%", padding: "12px 16px 12px 28px", borderRadius: 10,
                                                background: "rgba(255,255,255,0.04)",
                                                border: "1.5px solid rgba(255,255,255,0.08)",
                                                color: "#f0f0f5", fontSize: "0.92rem", outline: "none",
                                                boxSizing: "border-box", fontFamily: "inherit",
                                            }}
                                            onFocus={(e) => { e.target.style.borderColor = "#6366f1"; }}
                                            onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── STEP 4: Social / Portfolio Links ─────────────────────── */}
                    {step === 4 && (
                        <div>
                            <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#f0f0f5", marginBottom: 8 }}>Portfolio & Links</h2>
                            <p style={{ color: "#8888a0", fontSize: "0.9rem", marginBottom: 28 }}>Optional — builds trust and credibility with clients.</p>

                            {[
                                { icon: <Globe className="w-4 h-4" />, label: "Website / Portfolio", key: "website", placeholder: "https://yoursite.com" },
                                { icon: <Github className="w-4 h-4" />, label: "GitHub Username", key: "github", placeholder: "yourusername" },
                                { icon: <Twitter className="w-4 h-4" />, label: "Twitter / X Handle", key: "twitter", placeholder: "yourhandle (without @)" },
                            ].map((f) => (
                                <div key={f.key} style={{ marginBottom: 20 }}>
                                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", fontWeight: 600, color: "#8888a0", marginBottom: 8, letterSpacing: "0.04em" }}>
                                        <span style={{ color: "#555" }}>{f.icon}</span> {f.label}
                                    </label>
                                    <input
                                        type="text"
                                        value={form[f.key as keyof typeof form] as string}
                                        onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                                        placeholder={f.placeholder}
                                        style={{
                                            width: "100%", padding: "12px 16px", borderRadius: 10,
                                            background: "rgba(255,255,255,0.04)",
                                            border: "1.5px solid rgba(255,255,255,0.08)",
                                            color: "#f0f0f5", fontSize: "0.92rem", outline: "none",
                                            boxSizing: "border-box", fontFamily: "inherit",
                                            transition: "border-color 0.2s",
                                        }}
                                        onFocus={(e) => { e.target.style.borderColor = "#6366f1"; }}
                                        onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
                                    />
                                </div>
                            ))}

                            {/* Summary preview */}
                            <div style={{ marginTop: 12, padding: 16, borderRadius: 12, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
                                <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#818cf8", marginBottom: 8, letterSpacing: "0.06em", textTransform: "uppercase" }}>Profile Summary</p>
                                <p style={{ color: "#f0f0f5", fontWeight: 600, fontSize: "0.9rem" }}>{form.display_name || "—"}</p>
                                <p style={{ color: "#8888a0", fontSize: "0.82rem", marginTop: 2 }}>{form.title || "—"}</p>
                                {form.skills.length > 0 && (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                                        {form.skills.slice(0, 5).map((s) => (
                                            <span key={s} style={{ padding: "3px 10px", borderRadius: 99, background: "rgba(99,102,241,0.15)", color: "#818cf8", fontSize: "0.75rem", fontWeight: 600 }}>{s}</span>
                                        ))}
                                        {form.skills.length > 5 && <span style={{ color: "#555", fontSize: "0.75rem", alignSelf: "center" }}>+{form.skills.length - 5} more</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>

                {/* Navigation buttons */}
                {step > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: 640, marginTop: 24, gap: 12 }}>
                        {step > 1 ? (
                            <button
                                onClick={() => setStep((s) => s - 1)}
                                style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.1)", background: "transparent", color: "#8888a0", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
                            >
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>
                        ) : <div />}

                        {step < TOTAL_STEPS ? (
                            <button
                                onClick={() => setStep((s) => s + 1)}
                                disabled={step === 1 && !form.role}
                                style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    padding: "12px 32px", borderRadius: 10,
                                    background: step === 1 && !form.role ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #6366f1, #7c3aed)",
                                    color: step === 1 && !form.role ? "#444" : "#fff",
                                    fontSize: "0.9rem", fontWeight: 700, cursor: step === 1 && !form.role ? "not-allowed" : "pointer",
                                    border: "none", fontFamily: "inherit",
                                    boxShadow: step === 1 && !form.role ? "none" : "0 4px 20px rgba(99,102,241,0.35)",
                                    transition: "all 0.2s",
                                }}
                            >
                                Continue <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleFinish}
                                disabled={saving}
                                style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    padding: "12px 32px", borderRadius: 10,
                                    background: saving ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #6366f1, #7c3aed)",
                                    color: saving ? "#444" : "#fff",
                                    fontSize: "0.9rem", fontWeight: 700,
                                    cursor: saving ? "not-allowed" : "pointer",
                                    border: "none", fontFamily: "inherit",
                                    boxShadow: saving ? "none" : "0 4px 20px rgba(99,102,241,0.35)",
                                }}
                            >
                                {saving ? "Creating Profile…" : "Complete Registration"}
                                {!saving && <Check className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                )}

                {/* Skip link for existing users */}
                {step > 0 && (
                    <p style={{ marginTop: 20, color: "#444", fontSize: "0.82rem" }}>
                        Already have an account?{" "}
                        <button onClick={() => router.push("/jobs")} style={{ color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit" }}>
                            Go to Jobs →
                        </button>
                    </p>
                )}

            </main>

            <style>{`
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                input::placeholder, textarea::placeholder { color: #444; }
                input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
            `}</style>
        </div>
    );
}
