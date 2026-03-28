"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";

import Navbar from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { supabase } from "@/lib/supabase";
import { formatUSDC, formatAddress, getIPFSUrl } from "@/lib/utils";
import {
    Loader2, ExternalLink, Brain, Scale, ShieldCheck,
    FileText, CheckCircle2, ChevronDown, ChevronUp,
    ThumbsUp, ThumbsDown, FileDown
} from "lucide-react";
import DisputeTimeline from "@/components/disputes/DisputeTimeline";
import AIAnalysisReport from "@/components/disputes/AIAnalysisReport";
import JuryVotingPanel from "@/components/disputes/JuryVotingPanel";
import LegalReportViewer from "@/components/disputes/LegalReportViewer";

interface Job {
    id: string;
    title: string;
    description: string;
    amount: number;
    client: string;
    freelancer: string;
    deliverable_ipfs?: string;
}

interface AIAnalysis {
    id: string;
    recommendation: "CLIENT" | "FREELANCER" | "NEUTRAL";
    confidence: number;
    summary: string;
    reasoning: string[];
    analyzed_at: string;
}

interface Juror { id: string; juror_address: string; }
interface Vote { id: string; juror: string; decision: "CLIENT" | "FREELANCER"; voted_at: string; }

interface Dispute {
    id: string;
    contract_dispute_id: number;
    job_id: string;
    raised_by: string;
    reason: string;
    status: string;
    created_at: string;
    outcome?: string;
    resolved_at?: string;
    client_response?: string;
    freelancer_response?: string;
    ai_analysis?: AIAnalysis;
    votes?: Vote[];
    jurors?: Juror[];
}

interface LegalReport {
    id: string;
    dispute_id: string;
    report_text: string;
    report_ipfs: string | null;
    evidence_summary: { messages_count: number; voice_count: number; meet_transcript: boolean; ipfs_files_count: number; };
    recommendation: "CLIENT" | "FREELANCER" | "NEUTRAL";
    confidence: number;
    generated_at: string;
}

interface MeetRecording { id: string; transcript: string | null; }

export default function DisputeDetailsPage() {
    const params = useParams();
    const { address } = useAccount();

    const [dispute,            setDispute]            = useState<Dispute | null>(null);
    const [job,                setJob]                = useState<Job | null>(null);
    const [aiAnalysis,         setAiAnalysis]         = useState<AIAnalysis | null>(null);
    const [legalReport,        setLegalReport]        = useState<LegalReport | null>(null);
    const [isLoading,          setIsLoading]          = useState(true);
    const [isAnalyzing,        setIsAnalyzing]        = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [reportStep,         setReportStep]         = useState("");
    const [reportExpanded,     setReportExpanded]     = useState(true);
    const [isResponding,       setIsResponding]       = useState(false);

    useEffect(() => {
        fetchDisputeData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    const fetchDisputeData = async () => {
        setIsLoading(true);
        try {
            const { data: disputeData, error: disputeError } = await supabase
                .from("disputes").select("*, ai_analysis (*), votes (*), jurors (*)").eq("id", params.id).single();
            if (disputeError) throw disputeError;
            setDispute(disputeData);
            setAiAnalysis(disputeData.ai_analysis);

            const { data: jobData, error: jobError } = await supabase
                .from("jobs").select("*").eq("id", disputeData.job_id).single();
            if (jobError) throw jobError;
            setJob(jobData);

            const { data: reportData } = await supabase
                .from("legal_reports").select("*").eq("dispute_id", params.id as string).maybeSingle();
            if (reportData) setLegalReport(reportData as LegalReport);
        } catch (error) {
            console.error("Error fetching dispute data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRunAIAnalysis = async () => {
        if (!dispute || !job) return;
        setIsAnalyzing(true);
        try {
            const response = await fetch("/api/ai/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jobDescription: job.description, deliverable: "See IPFS deliverable",
                    clientEvidence: dispute.reason, freelancerEvidence: "Freelancer's counter-evidence",
                }),
            });
            const result = await response.json();
            if (result.success) {
                const { data, error } = await supabase.from("ai_analysis").insert({
                    dispute_id: dispute.id,
                    recommendation: result.analysis.recommendation, confidence: result.analysis.confidence,
                    summary: result.analysis.summary, reasoning: result.analysis.reasoning,
                }).select().single();
                if (error) throw error;
                setAiAnalysis(data);
                await supabase.from("disputes").update({ status: "AI_ANALYZED" }).eq("id", dispute.id);
                fetchDisputeData();
            }
        } catch (error) {
            console.error("AI analysis failed:", error);
            alert("AI analysis failed. Please check your API keys.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleGenerateLegalReport = async () => {
        if (!dispute || !job) return;
        setIsGeneratingReport(true);
        try {
            setReportStep("Collecting meeting transcripts…");
            const { data: recordings } = await supabase
                .from("meet_recordings").select("id, transcript").eq("job_id", job.id);
            const meetTranscript = ((recordings ?? []) as MeetRecording[])
                .map((r) => r.transcript ?? "").filter(Boolean).join("\n\n--- Next Session ---\n\n");

            setReportStep("Generating legal report with Nugen AI…");
            const res = await fetch("/api/dispute/legal-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ disputeId: dispute.id, messages: [], voiceTranscripts: [], meetTranscript }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Report generation failed");
            setLegalReport(data.report as LegalReport);
            setReportExpanded(true);
            setReportStep("");
        } catch (error) {
            console.error("Legal report failed:", error);
            alert("Legal report generation failed: " + (error instanceof Error ? error.message : String(error)));
            setReportStep("");
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const handleDisputeResponse = async (response: "AGREE" | "DISAGREE") => {
        if (!dispute || !address) return;
        setIsResponding(true);
        try {
            const res = await fetch("/api/dispute/respond", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ disputeId: dispute.id, wallet: address, response }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed");
            }
            await fetchDisputeData();
        } catch (err) {
            alert(`Failed: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsResponding(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-backdrop">
                <Navbar />
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-accent-indigo" />
                </div>
            </div>
        );
    }

    if (!dispute || !job) {
        return (
            <div className="min-h-screen bg-backdrop">
                <Navbar />
                <div className="container mx-auto px-6 py-12 text-center">
                    <p className="text-text-muted">Dispute not found</p>
                </div>
            </div>
        );
    }

    const timelineEvents = [
        {
            title: "Dispute Raised",
            description: `Raised by ${formatAddress(dispute.raised_by)}: ${dispute.reason}`,
            timestamp: new Date(dispute.created_at).toLocaleString(),
            status: "completed" as const,
        },
        {
            title: "AI Analysis",
            description: aiAnalysis ? `Completed with ${aiAnalysis.confidence}% confidence` : "AI ready to analyse evidence",
            timestamp: aiAnalysis ? new Date(aiAnalysis.analyzed_at).toLocaleString() : "Awaiting",
            status: aiAnalysis ? "completed" as const : (isAnalyzing ? "active" as const : "pending" as const),
        },
        {
            title: "Legal Report",
            description: legalReport ? `Formal report generated — ${legalReport.recommendation} prevails` : "Full legal arbitration report from all evidence",
            timestamp: legalReport ? new Date(legalReport.generated_at).toLocaleString() : "Pending",
            status: legalReport ? "completed" as const : "pending" as const,
        },
        {
            title: "Jury Selection",
            description: dispute.jurors && dispute.jurors.length > 0 ? `${dispute.jurors.length} jurors selected` : "Selecting jurors from the staked pool",
            timestamp: dispute.jurors && dispute.jurors.length > 0 ? "Jurors Selected" : "Pending",
            status: dispute.jurors && dispute.jurors.length > 0 ? "completed" as const : "pending" as const,
        },
        {
            title: "Final Resolution",
            description: dispute.status === "RESOLVED"
                ? `Consensus reached. Winner: ${dispute.outcome === "CLIENT_WINS" ? "Client" : "Freelancer"}`
                : "Awaiting jury consensus",
            timestamp: dispute.resolved_at ? new Date(dispute.resolved_at).toLocaleString() : "Pending",
            status: dispute.status === "RESOLVED" ? "completed" as const : "pending" as const,
        },
    ];

    return (
        <div className="min-h-screen bg-backdrop text-text-primary">
            <Navbar />

            <div className="container mx-auto px-6 py-12">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* Left Column */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="flex-1 space-y-6"
                        >
                            {/* Title */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
                                        <Scale className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold font-bold text-text-primary">
                                            Dispute #{dispute.contract_dispute_id || "0"}
                                        </h1>
                                        <p className="text-sm text-text-muted">Job: {job.title}</p>
                                    </div>
                                </div>
                                <Badge variant={dispute.status === "RESOLVED" ? "success" : "danger"} className="px-3 py-1">
                                    {dispute.status}
                                </Badge>
                            </div>

                            {/* ─── PDF Viewer + Agree/Disagree ─── */}
                            <div className="rounded-2xl border border-surface-border bg-surface-elevated/60 overflow-hidden">
                                <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-[#1DBF73]/15 rounded-lg flex items-center justify-center">
                                            <FileText className="w-4.5 h-4.5 text-[#1DBF73]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-text-primary">Dispute Report Document</p>
                                            <p className="text-xs text-text-muted">Auto-generated from project data</p>
                                        </div>
                                    </div>
                                    <a
                                        href={`/api/dispute/generate-pdf?disputeId=${dispute.id}`}
                                        download={`FairWork-Dispute-${dispute.id.slice(0, 8)}.pdf`}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-border/50 hover:bg-surface-border text-text-muted hover:text-text-primary text-xs font-medium transition-colors"
                                    >
                                        <FileDown className="w-3.5 h-3.5" /> Download
                                    </a>
                                </div>

                                {/* Embedded PDF */}
                                <div className="bg-[#525659]">
                                    <iframe
                                        src={`/api/dispute/generate-pdf?disputeId=${dispute.id}`}
                                        className="w-full border-0"
                                        style={{ height: "600px" }}
                                        title="Dispute Report PDF"
                                    />
                                </div>

                                {/* Agree / Disagree Buttons */}
                                {address && (() => {
                                    const isClient = address.toLowerCase() === job.client.toLowerCase();
                                    const isFreelancer = address.toLowerCase() === job.freelancer?.toLowerCase();
                                    const myResponse = isClient ? dispute.client_response : isFreelancer ? dispute.freelancer_response : null;
                                    const otherResponse = isClient ? dispute.freelancer_response : dispute.client_response;
                                    const myRole = isClient ? "Client" : isFreelancer ? "Freelancer" : null;

                                    if (!myRole) return null;

                                    return (
                                        <div className="px-5 py-5 border-t border-surface-border bg-surface">
                                            {myResponse ? (
                                                <div className="space-y-3">
                                                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${
                                                        myResponse === "AGREE"
                                                            ? "bg-[#E9F9F0] text-[#19A463] border border-[#1DBF73]/30"
                                                            : "bg-red-50 text-red-600 border border-red-200"
                                                    }`}>
                                                        {myResponse === "AGREE" ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
                                                        You ({myRole}) responded: <strong>{myResponse}</strong>
                                                    </div>
                                                    {otherResponse && (
                                                        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium ${
                                                            otherResponse === "AGREE"
                                                                ? "bg-[#E9F9F0]/50 text-[#19A463]"
                                                                : "bg-red-50/50 text-red-500"
                                                        }`}>
                                                            {isClient ? "Freelancer" : "Client"} responded: <strong>{otherResponse}</strong>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <p className="text-sm text-text-muted text-center">
                                                        Do you agree with the details in this dispute report?
                                                    </p>
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => handleDisputeResponse("AGREE")}
                                                            disabled={isResponding}
                                                            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl font-bold text-sm bg-[#1DBF73] hover:bg-[#19A463] text-white transition-all shadow-[0_0_15px_rgba(29,191,115,0.3)] hover:shadow-[0_0_25px_rgba(29,191,115,0.5)] disabled:opacity-50"
                                                        >
                                                            {isResponding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                                                            Agree
                                                        </button>
                                                        <button
                                                            onClick={() => handleDisputeResponse("DISAGREE")}
                                                            disabled={isResponding}
                                                            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl font-bold text-sm bg-red-500 hover:bg-red-600 text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] disabled:opacity-50"
                                                        >
                                                            {isResponding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-4 h-4" />}
                                                            Disagree
                                                        </button>
                                                    </div>
                                                    {otherResponse && (
                                                        <p className="text-xs text-text-subtle text-center">
                                                            {isClient ? "Freelancer" : "Client"} has already responded: <strong>{otherResponse}</strong>
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* AI Analysis */}
                            {aiAnalysis ? (
                                <AIAnalysisReport analysis={{
                                    recommendation: aiAnalysis.recommendation, confidence: aiAnalysis.confidence,
                                    summary: aiAnalysis.summary, reasoning: aiAnalysis.reasoning,
                                    analyzedAt: new Date(aiAnalysis.analyzed_at).getTime() / 1000,
                                }} />
                            ) : (
                                <div className="rounded-2xl border border-accent-indigo/20 bg-accent-indigo/5 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Brain className="w-6 h-6 text-accent-indigo" />
                                        <h3 className="text-base font-semibold font-bold text-text-primary">AI Analysis Needed</h3>
                                    </div>
                                    <p className="text-sm text-text-muted mb-6">
                                        Quick AI analysis based on job scope and dispute reason.
                                    </p>
                                    <Button onClick={handleRunAIAnalysis} disabled={isAnalyzing} className="w-full bg-accent-indigo hover:bg-accent-indigo/90">
                                        {isAnalyzing
                                            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing…</>
                                            : "Run AI Dispute Analysis"
                                        }
                                    </Button>
                                </div>
                            )}

                            {/* Legal Report */}
                            {legalReport ? (
                                <div className="border border-surface-border rounded-2xl overflow-hidden">
                                    <button
                                        onClick={() => setReportExpanded(!reportExpanded)}
                                        className="w-full flex items-center justify-between px-5 py-4 bg-surface hover:bg-surface-elevated transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center justify-center">
                                                <FileText className="w-4 h-4 text-amber-400" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-semibold text-text-primary">Legal Arbitration Report</p>
                                                <p className="text-xs text-text-muted">Generated {new Date(legalReport.generated_at).toLocaleString()}</p>
                                            </div>
                                            <span className="flex items-center gap-1.5 text-xs text-emerald-400 ml-2">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                                            </span>
                                        </div>
                                        {reportExpanded
                                            ? <ChevronUp className="w-4 h-4 text-text-muted" />
                                            : <ChevronDown className="w-4 h-4 text-text-muted" />
                                        }
                                    </button>
                                    {reportExpanded && (
                                        <div className="p-5 bg-backdrop">
                                            <LegalReportViewer report={legalReport} clientAddress={job.client} freelancerAddress={job.freelancer} />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <FileText className="w-6 h-6 text-amber-500" />
                                        <h3 className="text-base font-semibold font-bold text-text-primary">Generate Legal Report</h3>
                                    </div>
                                    <p className="text-sm text-text-muted mb-3">
                                        Generates a formal arbitration report by analysing all available evidence:
                                        chat messages, voice recording transcripts, meeting transcripts, and IPFS files.
                                        Powered by Nugen Legal AI.
                                    </p>
                                    <ul className="text-xs text-text-subtle space-y-1 mb-6 list-disc list-inside">
                                        <li>IPFS evidence files automatically fetched</li>
                                        <li>Meeting recordings transcribed via Whisper</li>
                                        <li>7-section formal arbitration report</li>
                                        <li>Report stored on IPFS for permanent record</li>
                                    </ul>
                                    {reportStep && (
                                        <div className="flex items-center gap-2 mb-4 text-sm text-text-muted">
                                            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                                            {reportStep}
                                        </div>
                                    )}
                                    <Button onClick={handleGenerateLegalReport} disabled={isGeneratingReport}
                                        className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                                        {isGeneratingReport
                                            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {reportStep || "Generating…"}</>
                                            : <><FileText className="w-4 h-4 mr-2" /> Generate Legal Arbitration Report</>
                                        }
                                    </Button>
                                </div>
                            )}

                            {/* Project Context */}
                            <div className="rounded-2xl border border-surface-border bg-surface-elevated/60 p-6">
                                <h3 className="text-base font-semibold font-bold text-text-primary mb-4">Project Context</h3>
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-text-muted text-xs uppercase tracking-wider">Original Scope</Label>
                                        <p className="text-text-primary mt-2 text-sm leading-relaxed">{job.description}</p>
                                    </div>
                                    <div className="pt-4 border-t border-surface-border flex justify-between items-center">
                                        <div>
                                            <Label className="text-text-muted text-xs uppercase tracking-wider">Amount in Dispute</Label>
                                            <p className="text-2xl font-bold font-bold text-accent-indigo mt-1">
                                                ${formatUSDC(BigInt(job.amount))} USDC
                                            </p>
                                        </div>
                                        {job.deliverable_ipfs && (
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={getIPFSUrl(job.deliverable_ipfs)} target="_blank" rel="noopener noreferrer" className="gap-2">
                                                    View Deliverable <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                            className="w-full lg:w-96 space-y-6"
                        >
                            <JuryVotingPanel
                                disputeId={BigInt(dispute.contract_dispute_id)}
                                jurors={dispute.jurors?.map(j => j.juror_address) || []}
                                votes={dispute.votes?.map(v => ({
                                    juror: v.juror, decision: v.decision, votedAt: new Date(v.voted_at).getTime() / 1000,
                                })) || []}
                                clientAddress={job.client}
                                freelancerAddress={job.freelancer}
                            />

                            <div className="rounded-2xl border border-surface-border bg-surface-elevated/60 p-6">
                                <h3 className="text-base font-semibold font-bold text-text-primary mb-4">Resolution Roadmap</h3>
                                <DisputeTimeline events={timelineEvents} />
                            </div>

                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-emerald-300">Immutable Arbitration</p>
                                    <p className="text-xs text-emerald-400/70 mt-1">
                                        The smart contract enforces the majority jury decision automatically. No human override possible after consensus.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </div>
        </div>
    );
}
