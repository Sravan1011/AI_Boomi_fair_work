"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import {
    Briefcase, Code2, Layers, ChevronRight, ChevronLeft,
    Check, Plus, X, MapPin, Globe, Github, Twitter,
    DollarSign, Award, User, FileText,
} from "lucide-react";

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

const inputClass = "w-full px-4 py-3 rounded-xl bg-white border border-[#E4E5E7] text-[#404145] text-sm placeholder:text-[#95979D] outline-none transition-colors focus:border-[#1DBF73]";

const StepDot = ({ index, current }: { index: number; current: number }) => (
    <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 ${
            index < current
                ? "bg-[#1DBF73] border-[#1DBF73] text-white"
                : index === current
                    ? "bg-[#1DBF73] border-[#1DBF73] text-white"
                    : "bg-[#F7F7F7] border-[#E4E5E7] text-[#95979D]"
        }`}>
            {index < current ? <Check className="w-3.5 h-3.5" /> : index + 1}
        </div>
        {index < TOTAL_STEPS - 1 && (
            <div className={`h-0.5 w-10 rounded-full transition-all ${
                index < current ? "bg-[#1DBF73]" : "bg-[#E4E5E7]"
            }`} />
        )}
    </div>
);

export default function RegisterPage() {
    const { address, isConnected } = useAccount();
    const router = useRouter();

    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [checking, setChecking] = useState(true);

    const [form, setForm] = useState({
        role: "" as "client" | "freelancer" | "both" | "",
        display_name: "", title: "", bio: "", location: "",
        skills: [] as string[],
        experience_level: "" as "entry" | "intermediate" | "expert" | "",
        hourly_rate: "", website: "", github: "", twitter: "",
    });

    useEffect(() => {
        if (!isConnected || !address) { setChecking(false); return; }
        supabase.from("profiles").select("wallet, is_registered")
            .eq("wallet", address.toLowerCase()).single()
            .then(({ data }) => {
                if (data?.is_registered) router.replace("/jobs");
                else { setStep(1); setChecking(false); }
            });
    }, [isConnected, address, router]);

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
            wallet: address.toLowerCase(), role: form.role || "freelancer",
            display_name: form.display_name, title: form.title, bio: form.bio,
            location: form.location, skills: form.skills,
            experience_level: form.experience_level || null,
            hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : null,
            website: form.website, github: form.github, twitter: form.twitter,
            is_registered: true, updated_at: new Date().toISOString(),
        });
        setSaving(false);
        router.push("/jobs");
    };

    if (checking) {
        return (
            <div className="min-h-screen bg-backdrop flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-accent-indigo border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-backdrop">
            <Navbar />

            {/* Glow background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full bg-accent-indigo/8 blur-3xl" />
                <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-accent-violet/6 blur-3xl" />
            </div>

            <main className="relative z-10 flex flex-col items-center pt-20 pb-20 px-6">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#1DBF73]/30 bg-[#E9F9F0] px-4 py-1.5 text-xs text-[#1DBF73] font-semibold tracking-widest uppercase mb-5">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-indigo animate-pulse" />
                        Create Your Account
                    </div>
                    <h1 className="font-heading text-[clamp(2rem,4vw,3rem)] font-bold text-text-primary tracking-tight">
                        {step === 0 ? "Connect your wallet" : "Set up your profile"}
                    </h1>
                    <p className="text-text-muted mt-3 text-base">
                        {step === 0
                            ? "Your wallet is your identity on FairWork."
                            : "Tell the community who you are and what you do."}
                    </p>
                </motion.div>

                {/* Step dots */}
                {step > 0 && (
                    <div className="flex items-center mb-10">
                        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                            <StepDot key={i} index={i} current={step - 1} />
                        ))}
                    </div>
                )}

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
                    className="w-full max-w-[640px] bg-white border border-[#E4E5E7] rounded-2xl px-11 py-10 shadow-card"
                >
                    <AnimatePresence mode="wait">
                        {/* STEP 0: Connect Wallet */}
                        {step === 0 && (
                            <motion.div key="step0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                                <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-accent-indigo/20 to-accent-violet/20 border border-accent-indigo/30 flex items-center justify-center mx-auto mb-7" style={{ width: 72, height: 72 }}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                        <rect x="2" y="5" width="20" height="14" rx="2" stroke="#818cf8" strokeWidth="1.5" />
                                        <path d="M16 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0z" fill="#818cf8" />
                                        <path d="M2 10h20" stroke="#818cf8" strokeWidth="1.5" />
                                    </svg>
                                </div>
                                <p className="text-text-muted mb-8 leading-relaxed">
                                    No passwords, no emails. Your wallet address is your unique identity — all your jobs, earnings, and reputation are tied to it.
                                </p>
                                <div className="flex justify-center">
                                    <ConnectButton label="Connect Wallet to Continue" showBalance={false} accountStatus="address" chainStatus="none" />
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 1: Role */}
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                                <h2 className="font-heading text-[1.4rem] font-bold text-text-primary mb-2">I want to...</h2>
                                <p className="text-text-muted text-sm mb-7">You can always do both. Choose what describes you best.</p>

                                <div className="flex flex-col gap-3">
                                    {[
                                        { value: "client", icon: <Briefcase className="w-5 h-5" />, label: "Hire Talent", desc: "Post jobs and find skilled professionals for my Web3 projects." },
                                        { value: "freelancer", icon: <Code2 className="w-5 h-5" />, label: "Find Work", desc: "Offer my skills and get paid securely in USDC via escrow." },
                                        { value: "both", icon: <Layers className="w-5 h-5" />, label: "Both — Hire & Work", desc: "I post jobs AND take on freelance work." },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setForm((f) => ({ ...f, role: opt.value as "client" | "freelancer" | "both" }))}
                                            className={`flex items-start gap-4 p-5 rounded-xl text-left transition-all border-[1.5px] ${
                                                form.role === opt.value
                                                    ? "border-[#1DBF73] bg-[#E9F9F0]"
                                                    : "border-[#E4E5E7] bg-white hover:border-[#1DBF73]/40"
                                            }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all border ${
                                                form.role === opt.value
                                                    ? "bg-[#E9F9F0] border-[#1DBF73]/40 text-[#1DBF73]"
                                                    : "bg-[#F7F7F7] border-[#E4E5E7] text-[#95979D]"
                                            }`}>
                                                {opt.icon}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-bold text-[0.95rem] ${form.role === opt.value ? "text-text-primary" : "text-text-muted"}`}>{opt.label}</p>
                                                <p className="text-text-subtle text-[0.82rem] mt-1 leading-relaxed">{opt.desc}</p>
                                            </div>
                                            {form.role === opt.value && (
                                                <div className="w-5 h-5 rounded-full bg-accent-indigo flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: Basic Info */}
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                                <h2 className="font-heading text-[1.4rem] font-bold text-text-primary mb-2">Basic Information</h2>
                                <p className="text-text-muted text-sm mb-7">This is how clients and freelancers will know you.</p>

                                {[
                                    { icon: <User className="w-4 h-4" />, label: "Display Name *", key: "display_name", placeholder: "e.g. Alex Rivera" },
                                    { icon: <Award className="w-4 h-4" />, label: "Professional Title *", key: "title", placeholder: "e.g. Smart Contract Developer" },
                                    { icon: <MapPin className="w-4 h-4" />, label: "Location", key: "location", placeholder: "e.g. San Francisco, CA" },
                                ].map((f) => (
                                    <div key={f.key} className="mb-5">
                                        <label className="flex items-center gap-1.5 text-[0.82rem] font-semibold text-text-muted mb-2 tracking-wide uppercase text-[11px]">
                                            <span className="text-text-subtle">{f.icon}</span> {f.label}
                                        </label>
                                        <input
                                            type="text"
                                            value={form[f.key as keyof typeof form] as string}
                                            onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                                            placeholder={f.placeholder}
                                            className={inputClass}
                                        />
                                    </div>
                                ))}

                                <div className="mb-5">
                                    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted mb-2 tracking-wide uppercase">
                                        <FileText className="w-4 h-4 text-text-subtle" /> Bio *
                                    </label>
                                    <textarea
                                        value={form.bio}
                                        onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                                        placeholder="Tell clients about your background, what you specialize in, and what makes you stand out..."
                                        rows={4}
                                        className={`${inputClass} resize-vertical`}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: Skills & Experience */}
                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                                <h2 className="font-heading text-[1.4rem] font-bold text-text-primary mb-2">Skills & Experience</h2>
                                <p className="text-text-muted text-sm mb-7">Help clients find you. Select up to 10 skills.</p>

                                {/* Skills picker */}
                                <div className="mb-7">
                                    <label className="text-[11px] font-semibold text-text-muted mb-2.5 tracking-wide uppercase block">
                                        Skills <span className="text-text-subtle font-normal">({form.skills.length}/10 selected)</span>
                                    </label>
                                    {form.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {form.skills.map((s) => (
                                                <button key={s} onClick={() => toggleSkill(s)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-indigo/15 border border-accent-indigo/35 text-[#1DBF73] text-[0.8rem] font-semibold hover:bg-accent-indigo/25 transition-all">
                                                    {s} <X className="w-3 h-3" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-1.5">
                                        {SKILLS.filter((s) => !form.skills.includes(s)).map((s) => (
                                            <button key={s} onClick={() => toggleSkill(s)}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#E4E5E7] bg-white text-[#74767E] text-[0.78rem] hover:border-[#1DBF73]/40 hover:text-[#1DBF73] transition-all">
                                                <Plus className="w-3 h-3" /> {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Experience Level */}
                                {(form.role === "freelancer" || form.role === "both") && (
                                    <div className="mb-7">
                                        <label className="text-[11px] font-semibold text-text-muted mb-2.5 tracking-wide uppercase block">Experience Level</label>
                                        <div className="flex gap-2.5">
                                            {EXPERIENCE_LEVELS.map((lvl) => (
                                                <button key={lvl.value}
                                                    onClick={() => setForm((f) => ({ ...f, experience_level: lvl.value as "entry" | "intermediate" | "expert" }))}
                                                    className={`flex-1 px-3 py-3 rounded-xl text-center transition-all border-[1.5px] ${
                                                        form.experience_level === lvl.value
                                                            ? "border-accent-indigo bg-accent-indigo/10"
                                                            : "border-[#E4E5E7] bg-white hover:border-[#1DBF73]/40"
                                                    }`}>
                                                    <p className={`font-bold text-[0.82rem] ${form.experience_level === lvl.value ? "text-text-primary" : "text-text-muted"}`}>{lvl.label}</p>
                                                    <p className="text-text-subtle text-[0.72rem] mt-1 leading-snug">{lvl.desc}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Hourly Rate */}
                                {(form.role === "freelancer" || form.role === "both") && (
                                    <div>
                                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted mb-2 tracking-wide uppercase">
                                            <DollarSign className="w-4 h-4 text-text-subtle" />
                                            Hourly Rate (USDC) <span className="text-text-subtle font-normal">— optional</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle text-sm">$</span>
                                            <input
                                                type="number" value={form.hourly_rate}
                                                onChange={(e) => setForm((f) => ({ ...f, hourly_rate: e.target.value }))}
                                                placeholder="e.g. 75"
                                                className={`${inputClass} pl-8`}
                                            />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* STEP 4: Links */}
                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                                <h2 className="font-heading text-[1.4rem] font-bold text-text-primary mb-2">Portfolio & Links</h2>
                                <p className="text-text-muted text-sm mb-7">Optional — builds trust and credibility with clients.</p>

                                {[
                                    { icon: <Globe className="w-4 h-4" />, label: "Website / Portfolio", key: "website", placeholder: "https://yoursite.com" },
                                    { icon: <Github className="w-4 h-4" />, label: "GitHub Username", key: "github", placeholder: "yourusername" },
                                    { icon: <Twitter className="w-4 h-4" />, label: "Twitter / X Handle", key: "twitter", placeholder: "yourhandle (without @)" },
                                ].map((f) => (
                                    <div key={f.key} className="mb-5">
                                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted mb-2 tracking-wide uppercase">
                                            <span className="text-text-subtle">{f.icon}</span> {f.label}
                                        </label>
                                        <input
                                            type="text"
                                            value={form[f.key as keyof typeof form] as string}
                                            onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                                            placeholder={f.placeholder}
                                            className={inputClass}
                                        />
                                    </div>
                                ))}

                                {/* Profile Summary */}
                                <div className="mt-3 p-4 rounded-xl bg-[#E9F9F0] border border-[#1DBF73]/20">
                                    <p className="text-[11px] font-bold text-[#1DBF73] mb-2 tracking-widest uppercase">Profile Summary</p>
                                    <p className="text-text-primary font-semibold text-[0.9rem]">{form.display_name || "—"}</p>
                                    <p className="text-text-muted text-[0.82rem] mt-0.5">{form.title || "—"}</p>
                                    {form.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                                            {form.skills.slice(0, 5).map((s) => (
                                                <span key={s} className="px-2.5 py-1 rounded-full bg-accent-indigo/15 text-[#1DBF73] text-[0.75rem] font-semibold">{s}</span>
                                            ))}
                                            {form.skills.length > 5 && <span className="text-text-subtle text-[0.75rem] self-center">+{form.skills.length - 5} more</span>}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Navigation */}
                {step > 0 && (
                    <div className="flex justify-between items-center w-full max-w-[640px] mt-6 gap-3">
                        {step > 1 ? (
                            <button
                                onClick={() => setStep((s) => s - 1)}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#E4E5E7] bg-white text-[#74767E] text-sm font-semibold hover:border-[#1DBF73]/40 hover:text-[#404145] transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>
                        ) : <div />}

                        {step < TOTAL_STEPS ? (
                            <button
                                onClick={() => setStep((s) => s + 1)}
                                disabled={step === 1 && !form.role}
                                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${
                                    step === 1 && !form.role
                                        ? "bg-[#F7F7F7] text-[#95979D] cursor-not-allowed"
                                        : "bg-[#1DBF73] hover:bg-[#19A463] text-white shadow-card"
                                }`}
                            >
                                Continue <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleFinish}
                                disabled={saving}
                                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${
                                    saving
                                        ? "bg-[#F7F7F7] text-[#95979D] cursor-not-allowed"
                                        : "bg-[#1DBF73] hover:bg-[#19A463] text-white shadow-card"
                                }`}
                            >
                                {saving ? "Creating Profile…" : <><Check className="w-4 h-4" /> Complete Registration</>}
                            </button>
                        )}
                    </div>
                )}

                {step > 0 && (
                    <p className="mt-5 text-text-subtle text-[0.82rem]">
                        Already have an account?{" "}
                        <button onClick={() => router.push("/jobs")} className="text-accent-indigo hover:text-[#1DBF73] transition-colors">
                            Go to Jobs →
                        </button>
                    </p>
                )}
            </main>
        </div>
    );
}
