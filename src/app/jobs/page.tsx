"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import JobCard from "@/components/jobs/JobCard";
import { supabase } from "@/lib/supabase";
import {
    Loader2, Plus, Search, Briefcase, Home, ChevronRight,
    ChevronDown, Code, Wallet, Shield, Cpu, Palette, FileCode,
    SlidersHorizontal, ToggleLeft
} from "lucide-react";
import Link from "next/link";

// Service category pills with icons
const servicePills = [
    { name: "Smart Contracts", icon: FileCode, color: "bg-purple-100 text-purple-600" },
    { name: "DeFi Apps", icon: Wallet, color: "bg-green-100 text-green-600" },
    { name: "NFT Projects", icon: Palette, color: "bg-pink-100 text-pink-600" },
    { name: "AI Agents", icon: Cpu, color: "bg-blue-100 text-blue-600" },
    { name: "Auditing", icon: Shield, color: "bg-orange-100 text-orange-600" },
    { name: "Frontend", icon: Code, color: "bg-cyan-100 text-cyan-600" },
];

const filterOptions = [
    { value: "all", label: "All Jobs" },
    { value: "open", label: "Open" },
    { value: "active", label: "In Progress" },
];

export default function JobsPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "open" | "active">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    useEffect(() => {
        fetchJobs();
    }, [filter]);

    const fetchJobs = async () => {
        setIsLoading(true);

        let query = supabase
            .from("jobs")
            .select("*")
            .order("created_at", { ascending: false });

        if (filter === "open") {
            query = query.eq("status", "OPEN");
        } else if (filter === "active") {
            query = query.in("status", ["ACCEPTED", "SUBMITTED"]);
        } else {
            // For "all" filter, exclude CANCELLED and RESOLVED jobs
            query = query.not("status", "in", '("CANCELLED","RESOLVED")');
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching jobs:", error);
        } else {
            setJobs(data || []);
        }

        setIsLoading(false);
    };

    const filteredJobs = jobs.filter(job =>
        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Category Navigation Bar */}
            <div className="border-b border-gray-200 bg-white">
                <div className="container-custom category-nav">
                    <span className="category-nav-item active flex items-center gap-1">
                        <span>🔥</span> Trending
                    </span>
                    <span className="category-nav-item">Smart Contracts</span>
                    <span className="category-nav-item">AI & ML</span>
                    <span className="category-nav-item">Web3 Apps</span>
                    <span className="category-nav-item">Design</span>
                    <span className="category-nav-item">Writing</span>
                    <span className="category-nav-item">Business</span>
                    <span className="category-nav-item">Finance</span>
                    <span className="category-nav-item">AI Services</span>
                </div>
            </div>

            {/* Page Header with Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="container-custom pt-6 pb-8">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Home className="w-4 h-4" />
                        <ChevronRight className="w-3 h-3" />
                        <span>Smart Contracts</span>
                    </div>

                    {/* Title Row */}
                    <div className="flex items-start justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Web3 Development
                            </h1>
                            <p className="text-gray-600">
                                Build decentralized apps with skilled Web3 developers
                                <Link href="#" className="ml-4 text-gray-900 font-medium hover:underline inline-flex items-center gap-1">
                                    ● How FairWork Works
                                </Link>
                            </p>
                        </div>
                        <Link
                            href="/jobs/create"
                            className="btn-primary shrink-0"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Post a Job
                        </Link>
                    </div>

                    {/* Service Pills - Horizontal Scroll */}
                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                        {servicePills.map((pill) => (
                            <button
                                key={pill.name}
                                className="service-pill shrink-0"
                            >
                                <div className={`service-pill-icon ${pill.color}`}>
                                    <pill.icon className="w-4 h-4" />
                                </div>
                                {pill.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white border-b border-gray-100 sticky top-20 z-40">
                <div className="container-custom py-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Left: Filter Dropdowns */}
                        <div className="flex items-center gap-3">
                            <button className="filter-dropdown">
                                Service options
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            <button className="filter-dropdown">
                                Budget
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            <button className="filter-dropdown">
                                Delivery time
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {/* Filter Pills */}
                            <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
                                {filterOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setFilter(option.value as any)}
                                        className={`category-pill !px-4 !py-2 ${filter === option.value ? "active" : ""}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right: Toggles & Sort */}
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                <input type="checkbox" className="sr-only" />
                                <div className="w-10 h-6 bg-gray-200 rounded-full relative transition-colors">
                                    <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow transition-transform" />
                                </div>
                                Pro services
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                <input type="checkbox" className="sr-only" />
                                <div className="w-10 h-6 bg-gray-200 rounded-full relative transition-colors">
                                    <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow transition-transform" />
                                </div>
                                Verified only
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="container-custom py-6">
                {/* Results Count & Sort */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-600 text-sm">
                        <span className="font-semibold text-gray-900">{filteredJobs.length}</span> results
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Sort by:</span>
                        <button className="font-semibold text-gray-900 flex items-center gap-1">
                            Best selling
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1DBF73]/20 focus:border-[#1DBF73] transition-all"
                        />
                    </div>
                </div>

                {/* Jobs Grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1DBF73] rounded-full animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Loading jobs...</p>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-24 bg-gray-50 rounded-2xl">
                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Briefcase className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            No jobs found
                        </h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Be the first to post a job on FairWork and find amazing Web3 talent!
                        </p>
                        <Link href="/jobs/create" className="btn-primary">
                            Post the First Job
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredJobs.map((job, index) => (
                            <div
                                key={job.id}
                                className="animate-fade-in-up"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <JobCard job={job} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
