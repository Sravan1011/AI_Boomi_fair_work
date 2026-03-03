"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { supabase } from "@/lib/supabase";
import { Save, Plus, X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import LandingFooter from "@/components/landing/LandingFooter";

const PREDEFINED_SKILLS = [
    "Solidity", "EVM", "Foundry", "Hardhat", "DeFi", "NFT", "Smart Contracts",
    "React", "Next.js", "TypeScript", "Node.js", "Python", "Rust", "Go",
    "AI/ML", "Web3.js", "Ethers.js", "Wagmi", "IPFS", "Filecoin",
    "Auditing", "Security", "Frontend", "Backend", "Full-Stack",
    "UI/UX", "Design", "Technical Writing", "Documentation",
];

export default function EditProfilePage() {
    const { address, isConnected } = useAccount();
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState({
        display_name: "",
        title: "",
        bio: "",
        skills: [] as string[],
        website: "",
        twitter: "",
        github: "",
    });

    useEffect(() => {
        if (!address) return;
        supabase
            .from("profiles")
            .select("*")
            .eq("wallet", address.toLowerCase())
            .single()
            .then(({ data }) => {
                if (data) {
                    setForm({
                        display_name: data.display_name || "",
                        title: data.title || "",
                        bio: data.bio || "",
                        skills: data.skills || [],
                        website: data.website || "",
                        twitter: data.twitter || "",
                        github: data.github || "",
                    });
                }
            });
    }, [address]);

    const toggleSkill = (skill: string) => {
        setForm((f) => ({
            ...f,
            skills: f.skills.includes(skill)
                ? f.skills.filter((s) => s !== skill)
                : f.skills.length < 10 ? [...f.skills, skill] : f.skills,
        }));
    };

    const handleSave = async () => {
        if (!address) return;
        setSaving(true);
        await supabase.from("profiles").upsert({
            wallet: address.toLowerCase(),
            ...form,
            updated_at: new Date().toISOString(),
        });
        setSaving(false);
        setSaved(true);
        setTimeout(() => { router.push(`/profile/${address}`); }, 1000);
    };

    const field = (label: string, key: keyof typeof form, placeholder: string, type: "text" | "textarea" = "text") => (
        <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 8, letterSpacing: "0.04em" }}>
                {label}
            </label>
            {type === "textarea" ? (
                <textarea
                    value={form[key] as string}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    rows={4}
                    style={{ width: "100%", padding: "12px 16px", fontSize: "0.92rem", resize: "vertical" }}
                />
            ) : (
                <input
                    type="text"
                    value={form[key] as string}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={{ width: "100%", padding: "12px 16px", fontSize: "0.92rem" }}
                />
            )}
        </div>
    );

    if (!isConnected) {
        return (
            <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
                <Navbar />
                <div className="container-custom pt-40 text-center">
                    <p style={{ color: "var(--text-muted)" }}>Connect wallet to edit your profile.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
            <Navbar />
            <div className="noise-overlay" aria-hidden="true" />
            <main className="container-custom pt-32 pb-24">
                <div style={{ maxWidth: 680, margin: "0 auto" }}>
                    <div style={{ marginBottom: 36 }}>
                        <p style={{ color: "var(--text-subtle)", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Profile Settings</p>
                        <h1 style={{ fontFamily: "Space Grotesk", fontSize: "2.5rem", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.03em" }}>Edit Profile</h1>
                    </div>

                    <div className="minimal-card" style={{ textAlign: "left", padding: 36 }}>
                        {field("Display Name", "display_name", "How you want to be known")}
                        {field("Professional Title", "title", "e.g. Smart Contract Developer")}
                        {field("Bio", "bio", "Tell clients about your experience and what you do best…", "textarea")}
                        {field("Website", "website", "https://yoursite.com")}
                        {field("Twitter", "twitter", "yourhandle (without @)")}
                        {field("GitHub", "github", "yourusername")}

                        {/* Skills */}
                        <div style={{ marginBottom: 28 }}>
                            <label style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 8, letterSpacing: "0.04em" }}>
                                Skills <span style={{ color: "var(--text-subtle)", fontWeight: 400 }}>({form.skills.length}/10 selected)</span>
                            </label>
                            {/* Selected chips */}
                            {form.skills.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                                    {form.skills.map((s) => (
                                        <button key={s} onClick={() => toggleSkill(s)} style={{
                                            display: "flex", alignItems: "center", gap: 6,
                                            padding: "5px 12px",
                                            borderRadius: 50,
                                            background: "var(--accent-dim)",
                                            border: "1px solid rgba(107,93,211,0.3)",
                                            color: "var(--accent-light)",
                                            fontSize: "0.8rem",
                                            fontWeight: 600,
                                            cursor: "none",
                                            fontFamily: "inherit",
                                        }}>
                                            {s} <X className="w-3 h-3" />
                                        </button>
                                    ))}
                                </div>
                            )}
                            {/* Available skills */}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                                {PREDEFINED_SKILLS.filter((s) => !form.skills.includes(s)).map((s) => (
                                    <button key={s} onClick={() => toggleSkill(s)} style={{
                                        display: "flex", alignItems: "center", gap: 5,
                                        padding: "5px 11px",
                                        borderRadius: 50,
                                        border: "1px solid var(--border)",
                                        background: "rgba(255,255,255,0.03)",
                                        color: "var(--text-muted)",
                                        fontSize: "0.78rem",
                                        cursor: "none",
                                        fontFamily: "inherit",
                                        transition: "all 0.2s",
                                    }}>
                                        <Plus className="w-3 h-3" /> {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-magnetic btn-primary-glow"
                            style={{ display: "flex", alignItems: "center", gap: 8, opacity: saving ? 0.7 : 1, fontFamily: "inherit" }}
                        >
                            <Save className="w-4 h-4" />
                            {saved ? "Saved! Redirecting…" : saving ? "Saving…" : "Save Profile"}
                        </button>
                    </div>
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
