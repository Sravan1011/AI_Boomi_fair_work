"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import { supabase } from "@/lib/supabase";
import { formatAddress } from "@/lib/utils";
import { Scale, Brain, Users, Clock, CheckCircle, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const statusConfig: Record<string, { bg: string; text: string; label: string; icon: React.ElementType }> = {
    OPEN: { bg: "bg-amber-50", text: "text-amber-600", label: "Pending Analysis", icon: Clock },
    AI_ANALYZED: { bg: "bg-blue-50", text: "text-blue-600", label: "AI Analyzed", icon: Brain },
    VOTING: { bg: "bg-purple-50", text: "text-purple-600", label: "DAO Voting", icon: Users },
    RESOLVED: { bg: "bg-[#E9F9F0]", text: "text-[#19A463]", label: "Resolved", icon: CheckCircle },
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
        <div className="min-h-screen bg-backdrop text-text-primary">
            <Navbar />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="border-b border-surface-border bg-surface"
            >
                <div className="max-w-[1600px] mx-auto px-6 py-12">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-[#1DBF73] flex items-center justify-center shadow-card">
                            <Scale className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-light font-bold text-text-primary">Dispute Center</h1>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-text-muted">Fair resolution powered by AI analysis and community governance</p>
                        <Link href="/test-ai">
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1DBF73] hover:bg-[#19A463] text-white text-sm font-medium rounded-xl transition-all whitespace-nowrap">
                                <Brain className="w-4 h-4" /> Try AI Demo
                            </button>
                        </Link>
                    </div>
                </div>
            </motion.div>

            <div className="max-w-[1600px] mx-auto px-6 py-8">
                {/* How It Works */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                    className="rounded-2xl border border-surface-border bg-surface-elevated/60 p-6 mb-8"
                >
                    <h3 className="font-medium font-bold text-text-primary mb-5">How Dispute Resolution Works</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: Brain, color: "bg-blue-50 text-blue-600", step: "1. AI Analysis", desc: "OpenAI analyzes the job and provides an unbiased recommendation" },
                            { icon: Users, color: "bg-purple-50 text-purple-600", step: "2. DAO Voting", desc: "3 community jurors vote on the final decision" },
                            { icon: CheckCircle, color: "bg-[#E9F9F0] text-[#1DBF73]", step: "3. Resolution", desc: "Funds are released based on the jury's decision" },
                        ].map((item) => (
                            <div key={item.step} className="flex gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-medium text-text-primary text-sm mb-1">{item.step}</div>
                                    <p className="text-text-muted text-sm">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* List */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-10 h-10 border-2 border-surface-border border-t-accent-indigo rounded-full animate-spin mb-4" />
                        <p className="text-text-muted text-sm">Loading disputes...</p>
                    </div>
                ) : disputes.length === 0 ? (
                    <div className="text-center py-24 rounded-2xl border border-surface-border bg-surface-elevated/40">
                        <div className="w-16 h-16 bg-[#E9F9F0] rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <CheckCircle className="w-8 h-8 text-[#1DBF73]" />
                        </div>
                        <h3 className="text-lg font-medium font-bold text-text-primary mb-2">No Active Disputes</h3>
                        <p className="text-text-muted max-w-md mx-auto text-sm">Great news! All jobs are proceeding smoothly without any conflicts.</p>
                    </div>
                ) : (
                    <motion.div
                        className="space-y-4"
                        initial="hidden"
                        animate="visible"
                        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
                    >
                        {disputes.map((dispute) => {
                            const status = statusConfig[dispute.status as string] || statusConfig.OPEN;
                            const StatusIcon = status.icon;
                            return (
                                <motion.div
                                    key={dispute.id as string}
                                    variants={{
                                        hidden: { opacity: 0, y: 12 },
                                        visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
                                    }}
                                >
                                    <Link href={`/disputes/${dispute.id}`} className="block">
                                        <div className="group rounded-2xl border border-surface-border bg-surface-elevated/60 p-6 hover:border-accent-indigo/30 hover:shadow-card-hover transition-all duration-300">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <h3 className="text-base font-medium font-bold text-text-primary group-hover:text-accent-indigo transition-colors">
                                                            {(dispute.jobs as Record<string, string>)?.title || "Untitled Job"}
                                                        </h3>
                                                        <span className={`inline-flex items-center gap-1.5 ${status.bg} ${status.text} px-3 py-1 rounded-full text-xs font-medium`}>
                                                            <StatusIcon className="w-3 h-3" /> {status.label}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-text-muted mb-3">
                                                        <span>Client: <span className="text-text-primary/70">{formatAddress((dispute.jobs as Record<string, string>)?.client || "")}</span></span>
                                                        <span>Freelancer: <span className="text-text-primary/70">{formatAddress((dispute.jobs as Record<string, string>)?.freelancer || "")}</span></span>
                                                    </div>
                                                    <p className="text-text-muted text-sm line-clamp-2">
                                                        <span className="text-text-subtle">Reason:</span> {dispute.reason as string}
                                                    </p>
                                                </div>
                                                <div className="w-9 h-9 rounded-full bg-surface-border flex items-center justify-center group-hover:bg-accent-indigo transition-colors flex-shrink-0">
                                                    <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-white transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
