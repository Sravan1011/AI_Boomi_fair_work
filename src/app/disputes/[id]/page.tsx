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
import { Loader2, ExternalLink, Brain, Scale, ShieldCheck } from "lucide-react";
import DisputeTimeline from "@/components/disputes/DisputeTimeline";
import AIAnalysisReport from "@/components/disputes/AIAnalysisReport";
import JuryVotingPanel from "@/components/disputes/JuryVotingPanel";

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

export default function DisputeDetailsPage() {
    const params = useParams();
    const [dispute, setDispute] = useState<Dispute | null>(null);
    const [job, setJob] = useState<Job | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        fetchDisputeData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    const fetchDisputeData = async () => {
        setIsLoading(true);
        try {
            // Fetch dispute metadata from Supabase
            const { data: disputeData, error: disputeError } = await supabase
                .from("disputes")
                .select(`
          *,
          ai_analysis (*),
          votes (*),
          jurors (*)
        `)
                .eq("id", params.id)
                .single();

            if (disputeError) throw disputeError;
            setDispute(disputeData);
            setAiAnalysis(disputeData.ai_analysis);

            // Fetch related job
            const { data: jobData, error: jobError } = await supabase
                .from("jobs")
                .select("*")
                .eq("id", disputeData.job_id)
                .single();

            if (jobError) throw jobError;
            setJob(jobData);
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
                    jobDescription: job.description,
                    deliverable: "Deliverable text/link from IPFS", // In a real app, you'd fetch the IPFS content here
                    clientEvidence: dispute.reason, // Plus any other evidence files
                    freelancerEvidence: "Freelancer's counter-evidence description",
                }),
            });

            const result = await response.json();
            if (result.success) {
                // Save analysis to Supabase
                const { data, error } = await supabase.from("ai_analysis").insert({
                    dispute_id: dispute.id,
                    recommendation: result.analysis.recommendation,
                    confidence: result.analysis.confidence,
                    summary: result.analysis.summary,
                    reasoning: result.analysis.reasoning,
                }).select().single();

                if (error) throw error;
                setAiAnalysis(data);

                // Update dispute status
                await supabase.from("disputes").update({ status: "AI_ANALYZED" }).eq("id", dispute.id);
                fetchDisputeData();
            }
        } catch (error) {
            console.error("AI analysis failed:", error);
            alert("AI analysis failed. Please check your API keys or try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

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

    const timelineEvents = [
        {
            title: "Dispute Raised",
            description: `Dispute raised by ${formatAddress(dispute.raised_by)} due to: ${dispute.reason}`,
            timestamp: new Date(dispute.created_at).toLocaleString(),
            status: "completed" as const,
        },
        {
            title: "AI Analysis",
            description: aiAnalysis
                ? `Analysis completed with ${aiAnalysis.confidence}% confidence`
                : "AI is ready to analyze the evidence and project scope",
            timestamp: aiAnalysis ? new Date(aiAnalysis.analyzed_at).toLocaleString() : "Awaiting analysis",
            status: aiAnalysis ? "completed" as const : (isAnalyzing ? "active" as const : "pending" as const),
        },
        {
            title: "Jury Selection",
            description: dispute.jurors && dispute.jurors.length > 0
                ? `${dispute.jurors.length} jurors have been selected to arbitrate`
                : "Selecting anonymous jurors from the staked pool",
            timestamp: dispute.jurors && dispute.jurors.length > 0 ? "Jurors Selected" : "Pending",
            status: dispute.jurors && dispute.jurors.length > 0 ? "completed" as const : "pending" as const,
        },
        {
            title: "Final Resolution",
            description: dispute.status === "RESOLVED"
                ? `Consensus reached. Winner: ${dispute.outcome === "CLIENT_WINS" ? "Client" : "Freelancer"}`
                : "Awaiting final consensus from the DAO jury",
            timestamp: dispute.resolved_at ? new Date(dispute.resolved_at).toLocaleString() : "Resolution pending",
            status: dispute.status === "RESOLVED" ? "completed" as const : "pending" as const,
        },
    ];

    return (
        <div className="min-h-screen bg-[#050505]">
            <Navbar />

            <div className="container mx-auto px-6 py-12">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* Left Column: Dispute Overview & AI Analysis */}
                        <div className="flex-1 space-y-6">
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
                                <Badge variant={dispute.status === "RESOLVED" ? "success" : "danger"} className="px-3 py-1">
                                    {dispute.status}
                                </Badge>
                            </div>

                            {/* AI Analysis Section */}
                            {aiAnalysis ? (
                                <AIAnalysisReport analysis={{
                                    recommendation: aiAnalysis.recommendation,
                                    confidence: aiAnalysis.confidence,
                                    summary: aiAnalysis.summary,
                                    reasoning: aiAnalysis.reasoning,
                                    analyzedAt: new Date(aiAnalysis.analyzed_at).getTime() / 1000
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
                                            Running an AI analysis provides an objective recommendation based on the project scope and deliverable quality.
                                        </p>
                                        <Button
                                            onClick={handleRunAIAnalysis}
                                            disabled={isAnalyzing}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            {isAnalyzing ? (
                                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing Case...</>
                                            ) : (
                                                "Run AI Dispute Analysis"
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Job Details Card */}
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
                                            <p className="text-xl font-bold text-indigo-600">${formatUSDC(BigInt(job.amount))} USDC</p>
                                        </div>
                                        {job.deliverable_ipfs && (
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={getIPFSUrl(job.deliverable_ipfs)} target="_blank" rel="noopener noreferrer" className="gap-2">
                                                    View Deliverable <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Timeline & Voting */}
                        <div className="w-full lg:w-96 space-y-6">
                            {/* Voting Panel */}
                            <JuryVotingPanel
                                disputeId={BigInt(dispute.contract_dispute_id)}
                                jurors={dispute.jurors?.map(j => j.juror_address) || []}
                                votes={dispute.votes?.map(v => ({
                                    juror: v.juror,
                                    decision: v.decision,
                                    votedAt: new Date(v.voted_at).getTime() / 1000
                                })) || []}
                                clientAddress={job.client}
                                freelancerAddress={job.freelancer}
                            />

                            {/* Timeline Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Resolution Roadmap</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <DisputeTimeline events={timelineEvents} />
                                </CardContent>
                            </Card>

                            {/* Trust Indicator */}
                            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-green-900 dark:text-green-100">Immutable Arbitration</p>
                                    <p className="text-xs text-green-700 dark:text-green-300">The smart contract enforces the majority decision automatically. No human intervention possible after consensus.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
