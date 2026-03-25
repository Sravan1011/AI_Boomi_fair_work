"use client";

import { motion } from "framer-motion";
import { formatUSDC, formatRelativeTime } from "@/lib/utils";
import { ArrowRight, Clock, Shield } from "lucide-react";
import Link from "next/link";

interface JobCardProps {
    job: {
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
    };
}

// ── Status → minimal label only, no color ─────────────────────────────────────
const STATUS_LABEL: Record<string, { label: string; dot: string }> = {
    OPEN:                    { label: "Open",           dot: "#1DBF73" },
    WAITING_CLIENT_APPROVAL: { label: "Pending",        dot: "#f59e0b" },
    ACCEPTED:                { label: "In Progress",    dot: "#6366f1" },
    SUBMITTED:               { label: "Under Review",   dot: "#f59e0b" },
    APPROVED:                { label: "Completed",      dot: "#10b981" },
    DISPUTED:                { label: "Disputed",       dot: "#ef4444" },
    RESOLVED:                { label: "Resolved",       dot: "#8b5cf6" },
};

// ── Category tag extraction ───────────────────────────────────────────────────
const TAG_MAP: [string[], string[]][] = [
    [["smart contract", "solidity", "erc20", "erc721"],         ["Solidity", "Smart Contract"]],
    [["nft", "erc-721", "mint", "metadata"],                    ["NFT", "ERC-721"]],
    [["defi", "protocol", "amm", "liquidity", "swap", "yield"], ["DeFi", "Protocol"]],
    [["frontend", "react", "ui", "interface", "nextjs"],        ["React", "Frontend"]],
    [["ai", "machine learning", "agent", "llm", "gpt"],         ["AI/ML", "Agents"]],
    [["audit", "security", "vulnerability", "exploit"],         ["Audit", "Security"]],
    [["dao", "governance", "voting", "proposal"],               ["DAO", "Governance"]],
    [["backend", "api", "server", "node", "graphql"],           ["Backend", "API"]],
    [["layer2", "l2", "zk", "rollup", "polygon"],               ["Layer 2", "ZK"]],
    [["mobile", "ios", "android", "flutter"],                   ["Mobile"]],
];

function extractTags(title: string, description: string): string[] {
    const text = (title + " " + description).toLowerCase();
    for (const [kw, tags] of TAG_MAP) {
        if (kw.some((k) => text.includes(k))) return tags;
    }
    return ["Web3", "Blockchain"];
}

function formatAddress(addr: string): string {
    if (!addr || addr.length < 10) return addr ?? "Unknown";
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatPostedTime(isoDate: string): string {
    try {
        const diff = Date.now() - new Date(isoDate).getTime();
        const h = Math.floor(diff / 3600000);
        if (h < 1) return "Just now";
        if (h < 24) return `${h}h ago`;
        const d = Math.floor(h / 24);
        return d < 30 ? `${d}d ago` : `${Math.floor(d / 30)}mo ago`;
    } catch { return "Recently"; }
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export default function JobCard({ job }: JobCardProps) {
    const status = STATUS_LABEL[job.status] ?? STATUS_LABEL.OPEN;
    const tags   = extractTags(job.title ?? "", job.description ?? "");
    const initials = job.client ? job.client.slice(2, 4).toUpperCase() : "??";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 group w-full"
        >
            <Link href={`/jobs/${job.id}`} className="block">
                <div
                    className="relative overflow-hidden rounded-[1.25rem] transition-all duration-300 group-hover:bg-white/[0.04] backdrop-blur-xl group-hover:translate-y-[-2px]"
                    style={{ 
                        background: "rgba(255, 255, 255, 0.02)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
                    }}
                >
                    {/* Hover Glow Edge effect */}
                    <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
                        style={{ boxShadow: "inset 0 0 20px rgba(29, 191, 115, 0.1)" }}
                    />

                    <div className="relative flex flex-col md:flex-row md:items-stretch py-6 px-6">
                        
                        {/* ── Avatar ── */}
                        <div className="shrink-0 mb-4 md:mb-0 md:mr-6">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black select-none"
                                style={{ 
                                    background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))", 
                                    color: "white", 
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1)"
                                }}
                            >
                                {initials}
                            </div>
                        </div>

                        {/* ── Main info ── */}
                        <div className="flex-1 min-w-0 pr-0 md:pr-6">
                            {/* Meta row */}
                            <div className="flex items-center gap-3 mb-2 flex-wrap text-[12px] font-medium tracking-wide">
                                <span className="flex items-center gap-1.5" style={{ color: "#e2e8f0" }}>
                                    <span
                                        className="w-2 h-2 rounded-full inline-block shrink-0 shadow-[0_0_8px_currentColor]"
                                        style={{ color: status.dot, backgroundColor: status.dot }}
                                    />
                                    {status.label}
                                </span>
                                <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
                                <span className="font-mono text-white/50">
                                    {formatAddress(job.client)}
                                </span>
                                <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
                                <span className="text-white/50">
                                    {formatPostedTime(job.created_at)}
                                </span>
                            </div>

                            {/* Title */}
                            <h3
                                className="font-bold mb-2 line-clamp-1 group-hover:text-[#1DBF73] transition-colors duration-300 text-white"
                                style={{ fontSize: "17px", letterSpacing: "-0.01em", lineHeight: 1.4 }}
                            >
                                {job.title}
                            </h3>

                            {/* Description */}
                            <p
                                className="text-[14px] leading-relaxed mb-4 line-clamp-2 text-white/60 font-light"
                            >
                                {job.description}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded border border-white/10"
                                        style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.7)" }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                                <span
                                    className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded"
                                    style={{ background: "rgba(29, 191, 115, 0.1)", color: "#1DBF73", border: "1px solid rgba(29, 191, 115, 0.2)" }}
                                >
                                    <Shield className="w-3 h-3" />
                                    Escrowed
                                </span>
                            </div>
                        </div>

                        {/* Divider for mobile */}
                        <div className="w-full h-px bg-white/10 my-6 md:hidden" />

                        {/* ── Right: price + CTA ── */}
                        <div
                            className="shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-40 md:pl-6 md:border-l border-white/10 relative z-10"
                        >
                            {/* Budget */}
                            <div className="text-left md:text-right">
                                <div className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                                    Budget
                                </div>
                                <div
                                    className="font-black leading-none text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]"
                                    style={{ fontSize: "24px", letterSpacing: "-0.03em" }}
                                >
                                    ${formatUSDC(BigInt(job.amount))}
                                </div>
                                <div className="text-[11px] mt-1 font-bold tracking-widest text-[#1DBF73]">USDC</div>
                            </div>

                            {/* CTA + deadline */}
                            <div className="text-right flex flex-col items-end md:mt-auto">
                                <span
                                    className="inline-flex items-center justify-end gap-1 text-[13px] font-bold transition-all duration-300 group-hover:gap-2 group-hover:text-white"
                                    style={{ color: "#1DBF73" }}
                                >
                                    View Details <ArrowRight className="w-4 h-4" />
                                </span>
                                <div className="flex items-center justify-end gap-1.5 mt-2 text-[11px] font-medium text-white/40">
                                    <Clock className="w-3.5 h-3.5" />
                                    {formatRelativeTime(job.deadline)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
