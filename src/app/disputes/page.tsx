"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { supabase } from "@/lib/supabase";
import { formatAddress } from "@/lib/utils";
import { Scale, Brain, Users, Clock, CheckCircle, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const statusConfig: Record<string, { bg: string; text: string; label: string; icon: React.ElementType }> = {
    OPEN: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Pending Analysis", icon: Clock },
    AI_ANALYZED: { bg: "bg-blue-500/10", text: "text-blue-400", label: "AI Analyzed", icon: Brain },
    VOTING: { bg: "bg-[#7c3aed]/10", text: "text-violet-400", label: "DAO Voting", icon: Users },
    RESOLVED: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Resolved", icon: CheckCircle },
};

export default function DisputesPage() {
    const [disputes, setDisputes] = useState<Record<string, unknown>[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { fetchDisputes(); }, []);

    const fetchDisputes = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("disputes")
            .select(`*, jobs (title, client, freelancer, amount)`)
            .order("created_at", { ascending: false });
        if (error) console.error("Error fetching disputes:", error);
        else setDisputes(data as Record<string, unknown>[] || []);
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-[#f0f0f5]">
            <Navbar />

            {/* Header */}
            <div className="border-b border-[#1a1a24] bg-[#0a0a0f]">
                <div className="max-w-screen-xl mx-auto px-6 py-12">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#7c3aed] flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Scale className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-light text-[#f0f0f5]">Dispute Center</h1>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-[#8888a0]">Fair resolution powered by AI analysis and community governance</p>
                        <Link href="/test-ai">
                            <button className="px-5 py-2.5 bg-gradient-to-r from-[#6366f1] to-[#7c3aed] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center gap-2 whitespace-nowrap">
                                <Brain className="w-4 h-4" /> Try AI Demo
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-screen-xl mx-auto px-6 py-8">
                {/* How It Works */}
                <div className="rounded-2xl border border-[#1a1a24] bg-[#111118]/60 p-6 mb-8">
                    <h3 className="font-medium text-[#f0f0f5] mb-5">How Dispute Resolution Works</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: Brain, color: "bg-blue-500/10 text-blue-400", step: "1. AI Analysis", desc: "OpenAI analyzes the job and provides an unbiased recommendation" },
                            { icon: Users, color: "bg-[#7c3aed]/10 text-violet-400", step: "2. DAO Voting", desc: "3 community jurors vote on the final decision" },
                            { icon: CheckCircle, color: "bg-emerald-500/10 text-emerald-400", step: "3. Resolution", desc: "Funds are released based on the jury's decision" },
                        ].map((item) => (
                            <div key={item.step} className="flex gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-medium text-[#f0f0f5] text-sm mb-1">{item.step}</div>
                                    <p className="text-[#8888a0] text-sm">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* List */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-10 h-10 border-2 border-[#1a1a24] border-t-[#6366f1] rounded-full animate-spin mb-4" />
                        <p className="text-[#8888a0] text-sm">Loading disputes...</p>
                    </div>
                ) : disputes.length === 0 ? (
                    <div className="text-center py-24 rounded-2xl border border-[#1a1a24] bg-[#111118]/40">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-medium text-[#f0f0f5] mb-2">No Active Disputes</h3>
                        <p className="text-[#8888a0] max-w-md mx-auto text-sm">Great news! All jobs are proceeding smoothly without any conflicts.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {disputes.map((dispute) => {
                            const status = statusConfig[dispute.status as string] || statusConfig.OPEN;
                            const StatusIcon = status.icon;
                            return (
                                <Link key={dispute.id as string} href={`/disputes/${dispute.id}`} className="block">
                                    <div className="group rounded-2xl border border-[#1a1a24] bg-[#111118]/60 p-6 hover:border-[#6366f1]/30 hover:shadow-lg hover:shadow-[#6366f1]/5 transition-all duration-300">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h3 className="text-base font-medium text-[#f0f0f5] group-hover:text-[#6366f1] transition-colors">
                                                        {(dispute.jobs as Record<string, string>)?.title || "Untitled Job"}
                                                    </h3>
                                                    <span className={`inline-flex items-center gap-1.5 ${status.bg} ${status.text} px-3 py-1 rounded-full text-xs font-medium`}>
                                                        <StatusIcon className="w-3 h-3" /> {status.label}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#8888a0] mb-3">
                                                    <span>Client: <span className="text-[#f0f0f5]/70">{formatAddress((dispute.jobs as Record<string, string>)?.client || "")}</span></span>
                                                    <span>Freelancer: <span className="text-[#f0f0f5]/70">{formatAddress((dispute.jobs as Record<string, string>)?.freelancer || "")}</span></span>
                                                </div>
                                                <p className="text-[#8888a0] text-sm line-clamp-2">
                                                    <span className="text-[#8888a0]/60">Reason:</span> {dispute.reason as string}
                                                </p>
                                            </div>
                                            <div className="w-9 h-9 rounded-full bg-[#1a1a24] flex items-center justify-center group-hover:bg-[#6366f1] transition-colors flex-shrink-0">
                                                <ArrowUpRight className="w-4 h-4 text-[#8888a0] group-hover:text-white transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
