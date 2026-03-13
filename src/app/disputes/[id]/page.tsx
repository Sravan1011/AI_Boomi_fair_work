"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { supabase } from "@/lib/supabase";
import { formatUSDC, formatAddress, getIPFSUrl } from "@/lib/utils";
import {
    Loader2, ExternalLink, Brain, Scale, ShieldCheck,
    FileText, CheckCircle2, ChevronDown, ChevronUp
} from "lucide-react";
import DisputeTimeline from "@/components/disputes/DisputeTimeline";
import AIAnalysisReport from "@/components/disputes/AIAnalysisReport";
import JuryVotingPanel from "@/components/disputes/JuryVotingPanel";
import LegalReportViewer from "@/components/disputes/LegalReportViewer";

// ── Interfaces ────────────────────────────────────────────────
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

interface Juror {
    id: string;
    juror_address: string;
}

interface Vote {
    id: string;
    juror: string;
    decision: "CLIENT" | "FREELANCER";
    voted_at: string;
}

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
    ai_analysis?: AIAnalysis;
    votes?: Vote[];
    jurors?: Juror[];
}

interface LegalReport {
    id: string;
    dispute_id: string;
    report_text: string;
    report_ipfs: string | null;
    evidence_summary: {
        messages_count: number;
        voice_count: number;
        meet_transcript: boolean;
        ipfs_files_count: number;
    };
    recommendation: "CLIENT" | "FREELANCER" | "NEUTRAL";
    confidence: number;
    generated_at: string;
}

interface MeetRecording {
    id: string;
    transcript: string | null;
}

// ── Page ──────────────────────────────────────────────────────
export default function DisputeDetailsPage() {
    const params = useParams();

    const [dispute,            setDispute]            = useState<Dispute | null>(null);
    const [job,                setJob]                = useState<Job | null>(null);
    const [aiAnalysis,         setAiAnalysis]         = useState<AIAnalysis | null>(null);
    const [legalReport,        setLegalReport]        = useState<LegalReport | null>(null);
    const [isLoading,          setIsLoading]          = useState(true);
    const [isAnalyzing,        setIsAnalyzing]        = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [reportStep,         setReportStep]         = useState("");
    const [reportExpanded,     setReportExpanded]     = useState(true);

    useEffect(() => {
        fetchDisputeData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    // ── Data fetching ─────────────────────────────────────────
    const fetchDisputeData = async () => {
        setIsLoading(true);
        try {
            const { data: disputeData, error: disputeError } = await supabase
                .from("disputes")
                .select("*, ai_analysis (*), votes (*), jurors (*)")
                .eq("id", params.id)
                .single();

            if (disputeError) throw disputeError;
            setDispute(disputeData);
            setAiAnalysis(disputeData.ai_analysis);

            const { data: jobData, error: jobError } = await supabase
                .from("jobs")
                .select("*")
                .eq("id", disputeData.job_id)
                .single();

            if (jobError) throw jobError;
            setJob(jobData);

            // Load existing legal report if any
            const { data: reportData } = await supabase
                .from("legal_reports")
                .select("*")
                .eq("dispute_id", params.id as string)
                .maybeSingle();

            if (reportData) setLegalReport(reportData as LegalReport);

        } catch (error) {
            console.error("Error fetching dispute data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // ── AI quick analysis ─────────────────────────────────────
    const handleRunAIAnalysis = async () => {
        if (!dispute || !job) return;
        setIsAnalyzing(true);
        try {
            const response = await fetch("/api/ai/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jobDescription:     job.description,
                    deliverable:        "See IPFS deliverable",
                    clientEvidence:     dispute.reason,
                    freelancerEvidence: "Freelancer's counter-evidence",
                }),
            });

            const result = await response.json();
            if (result.success) {
                const { data, error } = await supabase
                    .from("ai_analysis")
                    .insert({
                        dispute_id:     dispute.id,
                        recommendation: result.analysis.recommendation,
                        confidence:     result.analysis.confidence,
                        summary:        result.analysis.summary,
                        reasoning:      result.analysis.reasoning,
                    })
                    .select()
                    .single();

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

    // ── Full legal report ─────────────────────────────────────
    const handleGenerateLegalReport = async () => {
        if (!dispute || !job) return;
        setIsGeneratingReport(true);

        try {
            // Step 1: fetch meet recordings for this job
            setReportStep("Collecting meeting transcripts…");
            const { data: recordings } = await supabase
                .from("meet_recordings")
                .select("id, transcript")
                .eq("job_id", job.id);

            const meetRecordings = (recordings ?? []) as MeetRecording[];
            const meetTranscript = meetRecordings
                .map((r) => r.transcript ?? "")
                .filter(Boolean)
                .join("\n\n--- Next Session ---\n\n");

            // Step 2: generate legal report (XMTP messages passed as empty array
            // since they're fetched client-side by the chat component on the job page)
            setReportStep("Generating legal report with Nugen AI…");
            const res = await fetch("/api/dispute/legal-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    disputeId:       dispute.id,
                    messages:        [],          // enriched on job page via JobXmtpChat
                    voiceTranscripts:[],
                    meetTranscript:  meetTranscript,
                }),
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

    // ── Loading / not found ───────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050505]">
                <Navbar />
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            </div>
        );
    }

    if (!dispute || !job) {
        return (
            <div className="min-h-screen bg-[#050505]">
                <Navbar />
                <div className="container mx-auto px-6 py-12 text-center">
                    <p className="text-[#8888a0]">Dispute not found</p>
                </div>
            </div>
        );
    }

    // ── Timeline ──────────────────────────────────────────────
    const timelineEvents = [
        {
            title: "Dispute Raised",
            description: `Raised by ${formatAddress(dispute.raised_by)}: ${dispute.reason}`,
            timestamp: new Date(dispute.created_at).toLocaleString(),
            status: "completed" as const,
        },
        {
            title: "AI Analysis",
            description: aiAnalysis
                ? `Completed with ${aiAnalysis.confidence}% confidence`
                : "AI ready to analyse evidence",
            timestamp: aiAnalysis ? new Date(aiAnalysis.analyzed_at).toLocaleString() : "Awaiting",
            status: aiAnalysis ? "completed" as const : (isAnalyzing ? "active" as const : "pending" as const),
        },
        {
            title: "Legal Report",
            description: legalReport
                ? `Formal report generated — ${legalReport.recommendation} prevails`
                : "Full legal arbitration report from all evidence",
            timestamp: legalReport ? new Date(legalReport.generated_at).toLocaleString() : "Pending",
            status: legalReport ? "completed" as const : "pending" as const,
        },
        {
            title: "Jury Selection",
            description: dispute.jurors && dispute.jurors.length > 0
                ? `${dispute.jurors.length} jurors selected`
                : "Selecting jurors from the staked pool",
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
        <div className="min-h-screen bg-[#050505]">
            <Navbar />

            <div className="container mx-auto px-6 py-12">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* ── Left Column ──────────────────────────── */}
                        <div className="flex-1 space-y-6">

                            {/* Title */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
                                        <Scale className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold text-[#f0f0f5]">
                                            Dispute #{dispute.contract_dispute_id || "0"}
                                        </h1>
                                        <p className="text-sm text-slate-500">Job: {job.title}</p>
                                    </div>
                                </div>
                                <Badge
                                    variant={dispute.status === "RESOLVED" ? "success" : "danger"}
                                    className="px-3 py-1"
                                >
                                    {dispute.status}
                                </Badge>
                            </div>

                            {/* ── Quick AI Analysis ──────────────────── */}
                            {aiAnalysis ? (
                                <AIAnalysisReport analysis={{
                                    recommendation: aiAnalysis.recommendation,
                                    confidence:     aiAnalysis.confidence,
                                    summary:        aiAnalysis.summary,
                                    reasoning:      aiAnalysis.reasoning,
                                    analyzedAt:     new Date(aiAnalysis.analyzed_at).getTime() / 1000,
                                }} />
                            ) : (
                                <Card className="bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <Brain className="w-6 h-6 text-indigo-600" />
                                            <CardTitle>AI Analysis Needed</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-[#8888a0] mb-6">
                                            Quick AI analysis based on job scope and dispute reason.
                                        </p>
                                        <Button
                                            onClick={handleRunAIAnalysis}
                                            disabled={isAnalyzing}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            {isAnalyzing
                                                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing…</>
                                                : "Run AI Dispute Analysis"
                                            }
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {/* ── Legal Report Section ───────────────── */}
                            {legalReport ? (
                                <div className="border border-[#1a1a24] rounded-2xl overflow-hidden">
                                    {/* Collapsible header */}
                                    <button
                                        onClick={() => setReportExpanded(!reportExpanded)}
                                        className="w-full flex items-center justify-between px-5 py-4 bg-[#0f0f1a] hover:bg-[#111118] transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center justify-center">
                                                <FileText className="w-4 h-4 text-amber-400" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-semibold text-[#f0f0f5]">
                                                    Legal Arbitration Report
                                                </p>
                                                <p className="text-xs text-[#8888a0]">
                                                    Generated {new Date(legalReport.generated_at).toLocaleString()}
                                                </p>
                                            </div>
                                            <span className="flex items-center gap-1.5 text-xs text-emerald-400 ml-2">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                                            </span>
                                        </div>
                                        {reportExpanded
                                            ? <ChevronUp className="w-4 h-4 text-[#8888a0]" />
                                            : <ChevronDown className="w-4 h-4 text-[#8888a0]" />
                                        }
                                    </button>

                                    {reportExpanded && (
                                        <div className="p-5 bg-[#080810]">
                                            <LegalReportViewer
                                                report={legalReport}
                                                clientAddress={job.client}
                                                freelancerAddress={job.freelancer}
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Card className="border-amber-800/30 bg-amber-900/5">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-6 h-6 text-amber-500" />
                                            <CardTitle>Generate Legal Report</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-[#8888a0] mb-3">
                                            Generates a formal arbitration report by analysing all available evidence:
                                            chat messages, voice recording transcripts, meeting transcripts, and IPFS files.
                                            Powered by Nugen Legal AI.
                                        </p>
                                        <ul className="text-xs text-[#55556a] space-y-1 mb-6 list-disc list-inside">
                                            <li>IPFS evidence files automatically fetched</li>
                                            <li>Meeting recordings transcribed via Whisper</li>
                                            <li>7-section formal arbitration report</li>
                                            <li>Report stored on IPFS for permanent record</li>
                                        </ul>
                                        {reportStep && (
                                            <div className="flex items-center gap-2 mb-4 text-sm text-[#8888a0]">
                                                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                                                {reportStep}
                                            </div>
                                        )}
                                        <Button
                                            onClick={handleGenerateLegalReport}
                                            disabled={isGeneratingReport}
                                            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                                        >
                                            {isGeneratingReport
                                                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {reportStep || "Generating…"}</>
                                                : <><FileText className="w-4 h-4 mr-2" /> Generate Legal Arbitration Report</>
                                            }
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {/* ── Project Context ────────────────────── */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Project Context</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-slate-500">Original Scope</Label>
                                        <p className="text-slate-900 dark:text-slate-200 mt-1">{job.description}</p>
                                    </div>
                                    <div className="pt-4 border-t border-[#1a1a24] flex justify-between items-center">
                                        <div>
                                            <Label className="text-slate-500">Amount in Dispute</Label>
                                            <p className="text-xl font-bold text-indigo-600">
                                                ${formatUSDC(BigInt(job.amount))} USDC
                                            </p>
                                        </div>
                                        {job.deliverable_ipfs && (
                                            <Button variant="outline" size="sm" asChild>
                                                <a
                                                    href={getIPFSUrl(job.deliverable_ipfs)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="gap-2"
                                                >
                                                    View Deliverable <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* ── Right Column ─────────────────────────── */}
                        <div className="w-full lg:w-96 space-y-6">
                            <JuryVotingPanel
                                disputeId={BigInt(dispute.contract_dispute_id)}
                                jurors={dispute.jurors?.map(j => j.juror_address) || []}
                                votes={dispute.votes?.map(v => ({
                                    juror:     v.juror,
                                    decision:  v.decision,
                                    votedAt:   new Date(v.voted_at).getTime() / 1000,
                                })) || []}
                                clientAddress={job.client}
                                freelancerAddress={job.freelancer}
                            />

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Resolution Roadmap</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <DisputeTimeline events={timelineEvents} />
                                </CardContent>
                            </Card>

                            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                                        Immutable Arbitration
                                    </p>
                                    <p className="text-xs text-green-700 dark:text-green-300">
                                        The smart contract enforces the majority jury decision automatically. No human override possible after consensus.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
