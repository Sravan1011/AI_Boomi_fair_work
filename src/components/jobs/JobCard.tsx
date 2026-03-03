"use client";

import { formatUSDC, formatRelativeTime } from "@/lib/utils";
import { Clock, User, ArrowUpRight, Wallet } from "lucide-react";
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

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    OPEN: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400", label: "Open" },
    ACCEPTED: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400", label: "In Progress" },
    SUBMITTED: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400", label: "Pending Review" },
    APPROVED: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400", label: "Completed" },
    DISPUTED: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400", label: "Disputed" },
    RESOLVED: { bg: "bg-[#6366f1]/10", text: "text-[#6366f1]", dot: "bg-[#6366f1]", label: "Resolved" },
};

export default function JobCard({ job }: JobCardProps) {
    const status = statusConfig[job.status] || statusConfig.OPEN;

    return (
        <Link href={`/jobs/${job.id}`}>
            <div className="group h-full flex flex-col rounded-2xl border border-[#1a1a24] bg-[#111118]/60 backdrop-blur-sm hover:border-[#6366f1]/30 hover:shadow-lg hover:shadow-[#6366f1]/5 transition-all duration-300">
                {/* Header */}
                <div className="relative h-28 bg-gradient-to-br from-[#6366f1]/10 via-[#7c3aed]/5 to-transparent p-5 rounded-t-2xl border-b border-[#1a1a24]">
                    <span className={`inline-flex items-center gap-1.5 ${status.bg} ${status.text} px-3 py-1 rounded-full text-xs font-medium`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                    </span>
                    <div className="absolute bottom-5 right-5 flex items-center gap-1.5">
                        <Wallet className="w-4 h-4 text-[#6366f1]" />
                        <span className="text-xl font-bold text-[#f0f0f5]">
                            ${formatUSDC(BigInt(job.amount))}
                        </span>
                        <span className="text-xs text-[#8888a0]">USDC</span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-5 flex flex-col">
                    <h3 className="text-base font-semibold text-[#f0f0f5] group-hover:text-[#6366f1] transition-colors mb-2 line-clamp-2">
                        {job.title}
                    </h3>
                    <p className="text-[#8888a0] text-sm mb-4 line-clamp-2 flex-1 leading-relaxed">
                        {job.description}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#1a1a24]">
                        <div className="flex items-center gap-4 text-xs text-[#8888a0]">
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {formatRelativeTime(job.deadline)}
                            </span>
                            {job.freelancer && (
                                <span className="flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" />
                                    Assigned
                                </span>
                            )}
                        </div>
                        <div className="w-7 h-7 rounded-full bg-[#1a1a24] flex items-center justify-center group-hover:bg-[#6366f1] transition-colors">
                            <ArrowUpRight className="w-3.5 h-3.5 text-[#8888a0] group-hover:text-white transition-colors" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
