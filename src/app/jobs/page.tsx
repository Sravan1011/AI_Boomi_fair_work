"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import JobCard from "@/components/jobs/JobCard";
import { supabase } from "@/lib/supabase";
import { Plus, Search, Briefcase, ChevronDown, Code, Wallet, Shield, Cpu, Palette, FileCode } from "lucide-react";
import Link from "next/link";

interface Job {
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
}

const servicePills = [
    { name: "Smart Contracts", icon: FileCode },
    { name: "DeFi Apps", icon: Wallet },
    { name: "NFT Projects", icon: Palette },
    { name: "AI Agents", icon: Cpu },
    { name: "Auditing", icon: Shield },
    { name: "Frontend", icon: Code },
];

const filterOptions = [
    { value: "all", label: "All Jobs" },
    { value: "open", label: "Open" },
    { value: "active", label: "In Progress" },
];

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "open" | "active">("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    const fetchJobs = async () => {
        setIsLoading(true);
        let query = supabase.from("jobs").select("*").order("created_at", { ascending: false });
        if (filter === "open") query = query.eq("status", "OPEN");
        else if (filter === "active") query = query.in("status", ["ACCEPTED", "SUBMITTED"]);
        else query = query.not("status", "in", '("CANCELLED","RESOLVED")');
        const { data, error } = await query;
        if (error) console.error("Error fetching jobs:", error);
        else setJobs(data || []);
        setIsLoading(false);
    };

    const filteredJobs = jobs.filter(job =>
        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#050505] text-[#f0f0f5]">
            <Navbar />

            {/* Category Nav */}
            <div className="border-b border-[#1a1a24] bg-[#0a0a0f]">
                <div className="max-w-screen-xl mx-auto px-6">
                    <div className="flex gap-6 overflow-x-auto py-3 scrollbar-hide">
                        {["🔥 Trending", "Smart Contracts", "AI & ML", "Web3 Apps", "Design", "Writing", "Business", "Finance", "AI Services"].map((cat) => (
                            <button key={cat} className="shrink-0 text-sm text-[#8888a0] hover:text-[#f0f0f5] transition-colors pb-0.5 border-b-2 border-transparent hover:border-[#6366f1]/40 whitespace-nowrap">
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Page Header */}
            <div className="border-b border-[#1a1a24] bg-[#0a0a0f]">
                <div className="max-w-screen-xl mx-auto px-6 pt-8 pb-6">
                    <div className="flex items-start justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-light text-[#f0f0f5] mb-2">Web3 Development</h1>
                            <p className="text-[#8888a0]">Build decentralized apps with skilled Web3 developers</p>
                        </div>
                        <Link href="/jobs/create" className="flex items-center gap-2 px-5 py-2.5 bg-[#6366f1] text-white rounded-xl text-sm font-medium hover:bg-[#5254cc] transition-all shadow-lg shadow-indigo-500/20 shrink-0">
                            <Plus className="w-4 h-4" /> Post a Job
                        </Link>
                    </div>

                    {/* Service Pills */}
                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                        {servicePills.map((pill) => (
                            <button key={pill.name} className="flex items-center gap-2 shrink-0 px-4 py-2 rounded-xl bg-[#111118] border border-[#1a1a24] text-sm text-[#8888a0] hover:text-[#f0f0f5] hover:border-[#6366f1]/30 transition-all">
                                <pill.icon className="w-4 h-4" />
                                {pill.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="border-b border-[#1a1a24] bg-[#050505] sticky top-16 z-40">
                <div className="max-w-screen-xl mx-auto px-6 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {["Service options", "Budget", "Delivery time"].map((f) => (
                                <button key={f} className="flex items-center gap-1.5 px-4 py-2 text-sm text-[#8888a0] border border-[#1a1a24] rounded-lg hover:border-[#6366f1]/30 hover:text-[#f0f0f5] transition-all">
                                    {f} <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                            ))}
                            <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-[#1a1a24]">
                                {filterOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setFilter(option.value as "all" | "open" | "active")}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === option.value
                                            ? "bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/30"
                                            : "text-[#8888a0] hover:text-[#f0f0f5] border border-transparent"
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="max-w-screen-xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <p className="text-[#8888a0] text-sm">
                        <span className="font-medium text-[#f0f0f5]">{filteredJobs.length}</span> results
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-[#8888a0]">Sort by:</span>
                        <button className="font-medium text-[#f0f0f5] flex items-center gap-1 hover:text-[#6366f1] transition-colors">
                            Best selling <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-8">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888a0]" />
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-[#111118] border border-[#1a1a24] rounded-xl text-[#f0f0f5] placeholder:text-[#8888a0] text-sm focus:outline-none focus:border-[#6366f1]/40 transition-colors"
                        />
                    </div>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-10 h-10 border-2 border-[#1a1a24] border-t-[#6366f1] rounded-full animate-spin mb-4" />
                        <p className="text-[#8888a0] text-sm">Loading jobs...</p>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-24 rounded-2xl border border-[#1a1a24] bg-[#111118]/40">
                        <div className="w-16 h-16 bg-[#1a1a24] rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <Briefcase className="w-8 h-8 text-[#8888a0]" />
                        </div>
                        <h3 className="text-lg font-medium text-[#f0f0f5] mb-2">No jobs found</h3>
                        <p className="text-[#8888a0] mb-8 max-w-sm mx-auto text-sm">
                            Be the first to post a job on FairWork and find amazing Web3 talent!
                        </p>
                        <Link href="/jobs/create" className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#6366f1] text-white rounded-xl text-sm font-medium hover:bg-[#5254cc] transition-all">
                            Post the First Job
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredJobs.map((job) => (
                            <JobCard key={job.id} job={job} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
