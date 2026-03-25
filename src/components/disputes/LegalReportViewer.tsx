"use client";

import { useState } from "react";
import {
    Scale, Download, Printer, Shield, MessageSquare,
    Mic, Video, FileText, CheckCircle, AlertCircle,
    MinusCircle, ChevronDown, ChevronUp, ExternalLink
} from "lucide-react";
import { formatAddress } from "@/lib/utils";

interface EvidenceSummary {
    messages_count:   number;
    voice_count:      number;
    meet_transcript:  boolean;
    ipfs_files_count: number;
}

interface LegalReport {
    id:               string;
    dispute_id:       string;
    report_text:      string;
    report_ipfs:      string | null;
    evidence_summary: EvidenceSummary;
    recommendation:   "CLIENT" | "FREELANCER" | "NEUTRAL";
    confidence:       number;
    generated_at:     string;
}

interface Props {
    report:           LegalReport;
    clientAddress?:   string;
    freelancerAddress?: string;
}

// ── Parse report sections from the formatted text ────────────
function parseSections(reportText: string): { title: string; content: string }[] {
    const sectionRegex = /SECTION\s+\d+:\s+([^\n]+)\n([\s\S]*?)(?=SECTION\s+\d+:|━+|$)/g;
    const sections: { title: string; content: string }[] = [];
    let match;

    while ((match = sectionRegex.exec(reportText)) !== null) {
        const title   = match[1].trim();
        const content = match[2].trim();
        if (title && content) {
            sections.push({ title, content });
        }
    }

    // Fallback: split by double newlines if regex finds nothing
    if (sections.length === 0) {
        const blocks = reportText.split(/\n{2,}/);
        blocks.forEach((block) => {
            const lines = block.split("\n");
            if (lines.length > 0) {
                sections.push({ title: lines[0], content: lines.slice(1).join("\n") });
            }
        });
    }

    return sections;
}

// ── Recommendation badge ──────────────────────────────────────
function RecommendationBadge({ rec }: { rec: "CLIENT" | "FREELANCER" | "NEUTRAL" }) {
    const configs = {
        CLIENT:     { label: "Client Prevails",     icon: CheckCircle,  cls: "from-blue-500/20 to-blue-600/20 border-blue-500/40 text-blue-300" },
        FREELANCER: { label: "Freelancer Prevails",  icon: CheckCircle,  cls: "from-violet-500/20 to-purple-600/20 border-violet-500/40 text-violet-300" },
        NEUTRAL:    { label: "Neutral / Split Award", icon: MinusCircle, cls: "from-slate-500/20 to-slate-600/20 border-slate-500/40 text-slate-300" },
    };
    const { label, icon: Icon, cls } = configs[rec];

    return (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-gradient-to-r ${cls}`}>
            <Icon className="w-4 h-4" />
            <span className="font-semibold text-sm">{label}</span>
        </div>
    );
}

// ── Confidence bar ────────────────────────────────────────────
function ConfidenceBar({ confidence }: { confidence: number }) {
    const color =
        confidence >= 75 ? "bg-emerald-500" :
        confidence >= 50 ? "bg-amber-500"   : "bg-red-500";

    const label =
        confidence >= 75 ? "High Confidence" :
        confidence >= 50 ? "Moderate Confidence" : "Low Confidence";

    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 bg-[#1a1a24] rounded-full h-2 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${color}`}
                    style={{ width: `${confidence}%` }}
                />
            </div>
            <span className="text-xs text-[#8888a0] w-24 text-right">{confidence}% — {label}</span>
        </div>
    );
}

// ── Collapsible section card ──────────────────────────────────
function SectionCard({ title, content }: { title: string; content: string }) {
    const [open, setOpen] = useState(true);

    return (
        <div className="border border-[#1a1a24] rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#0f0f1a] hover:bg-[#111118] transition-colors"
            >
                <span className="text-sm font-semibold text-[#f0f0f5] uppercase tracking-wide">
                    {title}
                </span>
                {open
                    ? <ChevronUp className="w-4 h-4 text-[#8888a0]" />
                    : <ChevronDown className="w-4 h-4 text-[#8888a0]" />
                }
            </button>
            {open && (
                <div className="px-4 py-3 bg-[#080810]">
                    <pre className="text-xs text-[#c0c0d0] font-mono whitespace-pre-wrap leading-relaxed">
                        {content}
                    </pre>
                </div>
            )}
        </div>
    );
}

// ── Evidence badge pills ──────────────────────────────────────
function EvidencePill({ icon: Icon, label, count, active }: {
    icon: React.ElementType; label: string; count: number | boolean; active: boolean;
}) {
    return (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium
            ${active
                ? "border-[#1DBF73]/40 bg-[#E9F9F0] text-[#19A463]"
                : "border-[#E4E5E7] bg-[#F7F7F7] text-[#95979D]"
            }`}>
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
            {typeof count === "number" && count > 0 && (
                <span className="ml-1 bg-indigo-500/30 text-indigo-200 px-1.5 py-0.5 rounded-full">
                    {count}
                </span>
            )}
        </div>
    );
}

// ── Main component ────────────────────────────────────────────
export default function LegalReportViewer({ report, clientAddress, freelancerAddress }: Props) {
    const sections = parseSections(report.report_text);
    const ev = report.evidence_summary ?? {};

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        const blob = new Blob([report.report_text], { type: "text/plain" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href     = url;
        a.download = `FairWork-Legal-Report-${report.dispute_id.slice(0, 8)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-4 print:bg-white print:text-black">

            {/* ── Header ────────────────────────────────────────── */}
            <div className="bg-gradient-to-br from-[#0f0f1a] to-[#0a0a14] border border-[#1a1a24] rounded-2xl p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-600/20 border border-amber-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Scale className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-[#f0f0f5]">
                                FairWork Arbitration Tribunal
                            </h3>
                            <p className="text-xs text-[#8888a0] font-mono mt-0.5">
                                Generated {new Date(report.generated_at).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                        {report.report_ipfs && (
                            <a
                                href={`https://gateway.pinata.cloud/ipfs/${report.report_ipfs}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2a2a35] text-xs text-[#8888a0] hover:text-[#f0f0f5] hover:border-indigo-500/40 transition-all"
                            >
                                <ExternalLink className="w-3 h-3" /> IPFS
                            </a>
                        )}
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2a2a35] text-xs text-[#8888a0] hover:text-[#f0f0f5] hover:border-indigo-500/40 transition-all"
                        >
                            <Download className="w-3 h-3" /> Download
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2a2a35] text-xs text-[#8888a0] hover:text-[#f0f0f5] hover:border-indigo-500/40 transition-all"
                        >
                            <Printer className="w-3 h-3" /> Print
                        </button>
                    </div>
                </div>

                {/* Recommendation + confidence */}
                <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                        <RecommendationBadge rec={report.recommendation} />
                        <AlertCircle className="w-3.5 h-3.5 text-[#8888a0]" />
                        <span className="text-xs text-[#8888a0]">Advisory — enforced by on-chain jury vote</span>
                    </div>
                    <ConfidenceBar confidence={report.confidence} />
                </div>

                {/* Parties */}
                {(clientAddress || freelancerAddress) && (
                    <div className="mt-4 pt-4 border-t border-[#1a1a24] grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] text-[#55556a] uppercase tracking-wider mb-1">Client (Claimant)</p>
                            <p className="text-xs text-[#f0f0f5] font-mono">{clientAddress ? formatAddress(clientAddress) : "—"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-[#55556a] uppercase tracking-wider mb-1">Freelancer (Respondent)</p>
                            <p className="text-xs text-[#f0f0f5] font-mono">{freelancerAddress ? formatAddress(freelancerAddress) : "—"}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Evidence reviewed ─────────────────────────────── */}
            <div className="bg-[#0a0a0f] border border-[#1a1a24] rounded-xl p-4">
                <p className="text-xs font-semibold text-[#8888a0] uppercase tracking-wider mb-3">
                    Evidence Reviewed
                </p>
                <div className="flex flex-wrap gap-2">
                    <EvidencePill
                        icon={MessageSquare}
                        label="Chat messages"
                        count={ev.messages_count ?? 0}
                        active={(ev.messages_count ?? 0) > 0}
                    />
                    <EvidencePill
                        icon={Mic}
                        label="Voice recordings"
                        count={ev.voice_count ?? 0}
                        active={(ev.voice_count ?? 0) > 0}
                    />
                    <EvidencePill
                        icon={Video}
                        label="Meeting transcript"
                        count={ev.meet_transcript ? 1 : 0}
                        active={!!ev.meet_transcript}
                    />
                    <EvidencePill
                        icon={FileText}
                        label="IPFS evidence files"
                        count={ev.ipfs_files_count ?? 0}
                        active={(ev.ipfs_files_count ?? 0) > 0}
                    />
                </div>
            </div>

            {/* ── Report sections ───────────────────────────────── */}
            <div className="space-y-2">
                {sections.length > 0 ? (
                    sections.map((sec, i) => (
                        <SectionCard key={i} title={sec.title} content={sec.content} />
                    ))
                ) : (
                    // Fallback: render raw text
                    <div className="border border-[#1a1a24] rounded-xl p-4 bg-[#080810]">
                        <pre className="text-xs text-[#c0c0d0] font-mono whitespace-pre-wrap leading-relaxed">
                            {report.report_text}
                        </pre>
                    </div>
                )}
            </div>

            {/* ── Footer ───────────────────────────────────────── */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#0a0a0f] border border-[#1a1a24] rounded-xl">
                <Shield className="w-4 h-4 text-[#6366f1]" />
                <p className="text-xs text-[#55556a]">
                    This report is AI-generated by Nugen Legal AI and is advisory only.
                    Final enforcement requires a majority on-chain jury vote via the FairWork smart contract.
                </p>
            </div>
        </div>
    );
}
