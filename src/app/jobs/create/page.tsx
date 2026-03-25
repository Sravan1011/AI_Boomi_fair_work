"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, decodeEventLog } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import { ESCROW_ABI, USDC_ABI } from "@/lib/contracts";
import { ESCROW_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS } from "@/lib/wagmi";
import { supabase } from "@/lib/supabase";
import {
    Loader2, FileText, DollarSign, Calendar, Shield,
    CheckCircle, ArrowRight, Lock, Zap, Wallet,
} from "lucide-react";

// ─── Tag derivation ───────────────────────────────────────────────────────────
const TAG_MAP: [string[], string][] = [
    [["smart contract", "solidity", "erc20", "erc721"], "Smart Contract"],
    [["nft", "mint", "metadata"], "NFT"],
    [["defi", "protocol", "amm", "liquidity", "swap"], "DeFi"],
    [["frontend", "react", "ui", "nextjs"], "Frontend"],
    [["ai", "machine learning", "agent", "llm"], "AI/ML"],
    [["audit", "security", "vulnerability"], "Security Audit"],
    [["dao", "governance", "voting"], "DAO"],
    [["backend", "api", "server", "graphql"], "Backend"],
    [["layer2", "l2", "zk", "rollup"], "Layer 2"],
    [["mobile", "ios", "android"], "Mobile"],
];
function deriveTag(title: string, desc: string): string {
    const text = (title + " " + desc).toLowerCase();
    for (const [kw, tag] of TAG_MAP) {
        if (kw.some((k) => text.includes(k))) return tag;
    }
    return "Web3";
}

// ─── Step Progress ────────────────────────────────────────────────────────────
const STEPS = [
    { id: "form", label: "IPFS Upload" },
    { id: "approving", label: "Approve USDC" },
    { id: "creating", label: "Create Job" },
];

function StepProgress({ step }: { step: "form" | "approving" | "creating" }) {
    const idx = STEPS.findIndex((s) => s.id === step);
    return (
        <motion.div
            className="flex items-center justify-center mb-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {STEPS.map((s, i) => {
                const done = i < idx;
                const active = i === idx;
                return (
                    <div key={s.id} className="flex items-center">
                        <div className="flex flex-col items-center gap-1.5">
                            <motion.div
                                animate={active ? { boxShadow: ["0 0 0 0px rgba(29,191,115,0.25)", "0 0 0 8px rgba(29,191,115,0)", "0 0 0 0px rgba(29,191,115,0.25)"] } : {}}
                                transition={{ repeat: Infinity, duration: 1.8 }}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300"
                                style={{
                                    background: done || active ? "#1DBF73" : "#f0f5f2",
                                    color: done || active ? "white" : "#8a9e94",
                                }}
                            >
                                {done ? <CheckCircle className="w-4 h-4" /> : String(i + 1).padStart(2, "0")}
                            </motion.div>
                            <span
                                className="text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap"
                                style={{ color: done || active ? "#1DBF73" : "#8a9e94" }}
                            >
                                {s.label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <motion.div
                                className="h-px w-14 mx-3 mb-5 rounded-full"
                                style={{ background: i < idx ? "#1DBF73" : "#e2ede8" }}
                                animate={i < idx ? { scaleX: [0, 1] } : {}}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            />
                        )}
                    </div>
                );
            })}
        </motion.div>
    );
}

// ─── Live Job Preview Card ────────────────────────────────────────────────────
const GRADIENTS = [
    "from-[#d1fae5] to-[#a7f3d0]",
    "from-[#e0e7ff] to-[#c7d2fe]",
    "from-[#fef3c7] to-[#fde68a]",
    "from-[#e0f2fe] to-[#bae6fd]",
    "from-[#f3e8ff] to-[#e9d5ff]",
];

function JobPreviewCard({ title, description, amount, tag }: {
    title: string; description: string; amount: string; tag: string;
}) {
    const gradient = GRADIENTS[tag.length % GRADIENTS.length];
    const hasAny = title || amount;

    return (
        <div
            className="rounded-xl overflow-hidden border transition-all duration-300"
            style={{
                borderColor: hasAny ? "rgba(29,191,115,0.25)" : "#e2ede8",
                boxShadow: hasAny ? "0 4px 20px rgba(29,191,115,0.08)" : "none",
            }}
        >
            {/* Gradient header */}
            <div className={`bg-gradient-to-br ${gradient} p-4 h-[90px] flex flex-col justify-between`}>
                <div className="flex items-start justify-between">
                    <span
                        className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(255,255,255,0.75)", color: "#4a5e54" }}
                    >
                        {tag}
                    </span>
                    <div className="text-right">
                        <div className="text-[9px] font-medium uppercase tracking-wider text-[#4a5e54] mb-0.5">Budget</div>
                        <div
                            className="font-extrabold text-[#0f1a14] transition-all duration-200"
                            style={{ fontSize: "15px", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.02em" }}
                        >
                            {amount ? `$${parseFloat(amount).toLocaleString()}` : "—"}
                            <span className="text-[9px] font-normal text-[#8a9e94] ml-1">USDC</span>
                        </div>
                    </div>
                </div>
                <span
                    className="self-start text-[9px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                    style={{ background: "#E9F9F0", color: "#19A463", border: "1px solid rgba(29,191,115,0.25)" }}
                >
                    <span className="w-1 h-1 rounded-full bg-[#1DBF73]" /> Open
                </span>
            </div>

            {/* Body */}
            <div className="bg-white p-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={title.slice(0, 20)}
                        initial={{ opacity: 0.6 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                    >
                        <p
                            className="font-semibold text-[13px] leading-snug mb-1.5 line-clamp-2 min-h-[36px]"
                            style={{ fontFamily: "'Space Grotesk', sans-serif", color: title ? "#0f1a14" : "#c4d4cc" }}
                        >
                            {title || "Your job title will appear here…"}
                        </p>
                        <p className="text-[11px] leading-relaxed line-clamp-2 min-h-[28px]" style={{ color: description ? "#4a5e54" : "#c4d4cc" }}>
                            {description || "Description preview…"}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CreateJobPage() {
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const { writeContract, isPending: isWriting } = useWriteContract();

    const [formData, setFormData] = useState({ title: "", description: "", amount: "", deadline: "" });
    const [isUploading, setIsUploading] = useState(false);
    const [step, setStep] = useState<"form" | "approving" | "creating">("form");
    const [jobTxHash, setJobTxHash] = useState<`0x${string}` | undefined>();
    const [ipfsHashForJob, setIpfsHashForJob] = useState<string>("");

    const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: jobTxHash });

    useEffect(() => {
        const saveJobToDatabase = async () => {
            if (!receipt || !address || !ipfsHashForJob) return;
            try {
                const jobCreatedLog = receipt.logs.find((log) => {
                    try {
                        const decoded = decodeEventLog({ abi: ESCROW_ABI, data: log.data, topics: log.topics });
                        return decoded.eventName === "JobCreated";
                    } catch { return false; }
                });
                if (!jobCreatedLog) { alert("Job created on blockchain but couldn't find event."); return; }
                const decodedEvent = decodeEventLog({ abi: ESCROW_ABI, data: jobCreatedLog.data, topics: jobCreatedLog.topics });
                const jobId = (decodedEvent.args as Record<string, unknown>).jobId as bigint;
                const { error } = await supabase.from("jobs").insert({
                    contract_job_id: Number(jobId),
                    title: formData.title, description: formData.description,
                    description_ipfs: ipfsHashForJob,
                    amount: Number(parseUnits(formData.amount, 6)),
                    deadline: Math.floor(new Date(formData.deadline).getTime() / 1000),
                    client: address, status: "OPEN",
                });
                if (error) alert(`Failed to save: ${error.message}`);
                else { alert("✅ Job created successfully!"); setTimeout(() => router.push("/jobs"), 1000); }
            } catch (error) { console.error(error); }
        };
        saveJobToDatabase();
    }, [receipt, address, ipfsHashForJob, formData, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isConnected || !address) { alert("Please connect your wallet"); return; }
        try {
            setIsUploading(true);
            const uploadResponse = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jsonData: { title: formData.title, description: formData.description, createdBy: address, createdAt: Date.now() }, name: `job-${Date.now()}` }),
            });
            if (!uploadResponse.ok) { const e = await uploadResponse.json(); throw new Error(e.error); }
            const { ipfsHash } = await uploadResponse.json();
            setIsUploading(false);
            setStep("approving");
            const amountInWei = parseUnits(formData.amount, 6);
            writeContract({ address: USDC_CONTRACT_ADDRESS, abi: USDC_ABI, functionName: "approve", args: [ESCROW_CONTRACT_ADDRESS, amountInWei] }, {
                onSuccess: () => { setTimeout(() => { setStep("creating"); createJob(amountInWei, ipfsHash); }, 3000); },
            });
        } catch (error) { console.error(error); alert("Failed to create job."); setIsUploading(false); setStep("form"); }
    };

    const createJob = (amountInWei: bigint, ipfsHash: string) => {
        const deadlineTimestamp = Math.floor(new Date(formData.deadline).getTime() / 1000);
        setIpfsHashForJob(ipfsHash);
        writeContract({ address: ESCROW_CONTRACT_ADDRESS, abi: ESCROW_ABI, functionName: "createJob", args: [amountInWei, BigInt(deadlineTimestamp), ipfsHash] }, {
            onSuccess: (txHash) => { setJobTxHash(txHash); },
            onError: (error) => { alert(`Failed: ${error.message}`); setStep("form"); },
        });
    };

    const isLoading = isUploading || isWriting || isConfirming;
    const budget = parseFloat(formData.amount || "0");
    const platformFee = budget * 0.025;
    const totalLocked = budget + platformFee;
    const tag = deriveTag(formData.title, formData.description);
    const isFormComplete = !!(formData.title && formData.description && formData.amount && formData.deadline);

    const inputBase = [
        "w-full pl-11 pr-4 py-3.5 bg-[#f6f8f7] border border-[#e2ede8] rounded-xl",
        "text-[#0f1a14] placeholder:text-[#8a9e94] text-sm",
        "focus:outline-none focus:border-[#1DBF73] focus:bg-white focus:shadow-[0_0_0_3px_rgba(29,191,115,0.10)]",
        "transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
    ].join(" ");

    const labelClass = "block text-[11px] font-bold text-[#0f1a14] uppercase tracking-[0.08em] mb-2";

    return (
        <div className="min-h-screen bg-[#f6f8f7]">
            {/* Font imports */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
            `}</style>

            <Navbar />

            {/* Top accent bar */}
            <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, #1DBF73 30%, rgba(99,102,241,0.4) 70%, transparent)" }} />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 lg:py-14">

                {/* ── Header ── */}
                <motion.div
                    className="mb-10"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.38, ease: "easeOut" }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9F9F0] border border-[#b7eed2] mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1DBF73] flex-shrink-0" />
                        <span className="text-[#19A463] text-[11px] font-bold uppercase tracking-widest">Escrow-Protected</span>
                    </div>
                    <h1
                        className="text-[#0f1a14] mb-2"
                        style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)",
                            fontWeight: 700,
                            letterSpacing: "-0.04em",
                            lineHeight: 1.1,
                        }}
                    >
                        Post a New Job
                    </h1>
                    <p className="text-[#4a5e54] text-[14px] max-w-md leading-relaxed">
                        Your USDC is locked in a smart contract and released only when you approve the completed work.
                    </p>
                </motion.div>

                {/* ── Step progress (while loading) ── */}
                <AnimatePresence>
                    {isLoading && <StepProgress step={step} />}
                </AnimatePresence>

                {/* ── Two-column layout ── */}
                <motion.div
                    className="grid lg:grid-cols-[1fr_340px] gap-5 items-start"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                >
                    {/* ── LEFT: Form ── */}
                    <div
                        className="bg-white rounded-2xl border border-[#e2ede8]"
                        style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
                    >
                        {/* Card header */}
                        <div className="px-7 lg:px-9 pt-8 pb-0">
                            <h2
                                className="text-[#0f1a14] mb-1"
                                style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "15px", fontWeight: 600, letterSpacing: "-0.01em" }}
                            >
                                Job Details
                            </h2>
                            <p className="text-[12px] text-[#8a9e94]">Fill in the details — the preview updates live on the right.</p>
                        </div>

                        <div className="h-px mx-7 lg:mx-9 my-6 bg-[#f0f5f2]" />

                        <form id="job-form" onSubmit={handleSubmit} className="px-7 lg:px-9 pb-8 space-y-6">

                            {/* Title */}
                            <div>
                                <label className={labelClass}>Job Title <span className="text-[#1DBF73] normal-case font-normal">*</span></label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a9e94] pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder='e.g., "Build a DeFi Yield Aggregator"'
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required disabled={isLoading}
                                        className={inputBase}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className={labelClass}>Description <span className="text-[#1DBF73] normal-case font-normal">*</span></label>
                                <textarea
                                    placeholder="Describe deliverables, tech stack, acceptance criteria, and any relevant links…"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required disabled={isLoading} rows={5}
                                    className="w-full px-4 py-3.5 bg-[#f6f8f7] border border-[#e2ede8] rounded-xl text-[#0f1a14] placeholder:text-[#8a9e94] text-sm focus:outline-none focus:border-[#1DBF73] focus:bg-white focus:shadow-[0_0_0_3px_rgba(29,191,115,0.10)] transition-all duration-150 resize-none disabled:opacity-50"
                                />
                            </div>

                            {/* Budget + Deadline */}
                            <div className="grid sm:grid-cols-2 gap-5">
                                {/* Budget */}
                                <div>
                                    <label className={labelClass}>Budget <span className="text-[#1DBF73] normal-case font-normal">*</span></label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a9e94] pointer-events-none" />
                                        <input
                                            type="number" step="0.01" min="1" placeholder="500"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            required disabled={isLoading}
                                            className={inputBase}
                                            style={{ fontFamily: "'JetBrains Mono', monospace", paddingRight: "52px" }}
                                        />
                                        <span
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-medium text-[#8a9e94] pointer-events-none"
                                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                        >
                                            USDC
                                        </span>
                                    </div>
                                    <AnimatePresence>
                                        {budget > 0 && (
                                            <motion.p
                                                className="text-[11px] text-[#8a9e94] mt-2 flex items-center gap-1"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                            >
                                                <Zap className="w-3 h-3 text-[#f59e0b] flex-shrink-0" />
                                                2.5% fee = ${platformFee.toFixed(2)} USDC
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Deadline */}
                                <div>
                                    <label className={labelClass}>Deadline <span className="text-[#1DBF73] normal-case font-normal">*</span></label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a9e94] pointer-events-none" />
                                        <input
                                            type="datetime-local"
                                            value={formData.deadline}
                                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                            required disabled={isLoading}
                                            className={`${inputBase} pr-4`}
                                            style={{ colorScheme: "light" }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Wallet status row */}
                            <motion.div
                                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                                animate={{
                                    background: isConnected ? "#E9F9F0" : "#FFFBEB",
                                    borderColor: isConnected ? "rgba(29,191,115,0.25)" : "rgba(245,158,11,0.30)",
                                }}
                                style={{ border: "1px solid" }}
                                transition={{ duration: 0.3 }}
                            >
                                <Wallet className={`w-4 h-4 flex-shrink-0 ${isConnected ? "text-[#1DBF73]" : "text-[#f59e0b]"}`} />
                                {isConnected ? (
                                    <div className="flex items-center justify-between flex-1 min-w-0">
                                        <span className="text-[12px] font-semibold text-[#19A463]">Wallet connected</span>
                                        <span
                                            className="text-[11px] text-[#4a5e54]"
                                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                        >
                                            {address?.slice(0, 6)}…{address?.slice(-4)}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-[12px] font-medium text-[#B45309]">
                                        Connect your wallet to post a job
                                    </span>
                                )}
                            </motion.div>
                        </form>
                    </div>

                    {/* ── RIGHT: Summary ── */}
                    <div className="flex flex-col gap-4 lg:sticky lg:top-24">

                        {/* Live preview */}
                        <div
                            className="bg-white rounded-2xl border border-[#e2ede8] p-4"
                            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
                        >
                            <p className="text-[10px] font-bold text-[#8a9e94] uppercase tracking-[0.1em] mb-3">Live Preview</p>
                            <JobPreviewCard
                                title={formData.title}
                                description={formData.description}
                                amount={formData.amount}
                                tag={tag}
                            />
                        </div>

                        {/* Order summary */}
                        <div
                            className="bg-white rounded-2xl border border-[#e2ede8] p-5"
                            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
                        >
                            <p className="text-[10px] font-bold text-[#8a9e94] uppercase tracking-[0.1em] mb-4">Order Summary</p>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[13px] text-[#4a5e54]">Job Budget</span>
                                    <span
                                        className="text-[#0f1a14] font-medium text-[13px]"
                                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                    >
                                        {budget > 0 ? `$${budget.toFixed(2)}` : "—"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[13px] text-[#4a5e54]">
                                        Platform Fee{" "}
                                        <span className="text-[11px] text-[#8a9e94]">(2.5%)</span>
                                    </span>
                                    <span
                                        className="text-[#4a5e54] text-[13px]"
                                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                    >
                                        {budget > 0 ? `$${platformFee.toFixed(2)}` : "—"}
                                    </span>
                                </div>
                            </div>

                            {/* Dashed divider — receipt style */}
                            <div className="my-4 border-t-2 border-dashed border-[#e2ede8]" />

                            {/* Total */}
                            <div className="flex items-center justify-between">
                                <span className="text-[14px] font-semibold text-[#0f1a14]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                    Total Locked
                                </span>
                                <div className="text-right">
                                    <motion.div
                                        key={totalLocked.toFixed(2)}
                                        initial={{ y: -4, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="font-extrabold text-[#1DBF73]"
                                        style={{
                                            fontFamily: "'JetBrains Mono', monospace",
                                            fontSize: "20px",
                                            letterSpacing: "-0.02em",
                                        }}
                                    >
                                        {budget > 0 ? `$${totalLocked.toFixed(2)}` : "—"}
                                    </motion.div>
                                    <p className="text-[10px] text-[#8a9e94] font-medium mt-0.5">USDC · Polygon Amoy</p>
                                </div>
                            </div>

                            {/* Escrow note */}
                            <div
                                className="flex items-start gap-2.5 mt-4 px-3.5 py-3 rounded-xl"
                                style={{ background: "linear-gradient(135deg, #E9F9F0, #f0fdf7)", border: "1px solid rgba(29,191,115,0.20)" }}
                            >
                                <Lock className="w-4 h-4 text-[#1DBF73] flex-shrink-0 mt-0.5" />
                                <p className="text-[11px] text-[#4a5e54] leading-relaxed">
                                    Funds held by smart contract. Released only when{" "}
                                    <strong className="text-[#0f1a14] font-semibold">you approve</strong> the delivered work.
                                </p>
                            </div>
                        </div>

                        {/* CTA */}
                        <motion.button
                            type="submit"
                            form="job-form"
                            disabled={isLoading || !isConnected}
                            whileHover={!isLoading && isConnected ? { scale: 1.02, boxShadow: "0 8px 28px rgba(29,191,115,0.40)" } : {}}
                            whileTap={!isLoading && isConnected ? { scale: 0.98 } : {}}
                            className="w-full py-4 rounded-full text-white font-bold text-[14px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                            style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                                letterSpacing: "-0.01em",
                                background: isLoading
                                    ? "#a8c4b8"
                                    : "linear-gradient(135deg, #1DBF73 0%, #17a862 100%)",
                                boxShadow: isLoading ? "none" : "0 4px 20px rgba(29,191,115,0.32)",
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {step === "form" && "Uploading to IPFS…"}
                                    {step === "approving" && "Approving USDC…"}
                                    {step === "creating" && "Creating on-chain…"}
                                </>
                            ) : (
                                <>
                                    Fund Escrow
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </motion.button>

                        {/* Trust signals */}
                        <div className="flex items-center justify-center gap-6 pt-0.5">
                            {[
                                { Icon: Shield, label: "Buyer Protected" },
                                { Icon: Zap, label: "Instant Release" },
                                { Icon: CheckCircle, label: "On-chain" },
                            ].map(({ Icon, label }) => (
                                <div key={label} className="flex flex-col items-center gap-1.5">
                                    <Icon className="w-4 h-4 text-[#c4d4cc]" />
                                    <span className="text-[9px] font-semibold text-[#8a9e94] uppercase tracking-wider text-center">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
