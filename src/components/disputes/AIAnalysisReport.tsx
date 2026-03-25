"use client";


import { Brain, TrendingUp, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { AIAnalysis } from "@/types/dispute";

interface AIAnalysisReportProps {
    analysis: AIAnalysis;
}

export default function AIAnalysisReport({ analysis }: AIAnalysisReportProps) {
    const getRecommendationConfig = () => {
        if (analysis.recommendation === "CLIENT") {
            return {
                gradient: "from-blue-500 via-blue-600 to-indigo-600",
                text: "Favor Client",
                icon: "text-blue-500",
                bg: "bg-blue-500/10",
                border: "border-blue-500/20"
            };
        }
        if (analysis.recommendation === "FREELANCER") {
            return {
                gradient: "from-purple-500 via-purple-600 to-pink-600",
                text: "Favor Freelancer",
                icon: "text-purple-500",
                bg: "bg-purple-500/10",
                border: "border-purple-500/20"
            };
        }
        return {
            gradient: "from-slate-500 via-slate-600 to-slate-700",
            text: "Neutral / Unclear",
            icon: "text-slate-500",
            bg: "bg-slate-500/10",
            border: "border-slate-500/20"
        };
    };

    const getConfidenceGradient = () => {
        if (analysis.confidence >= 75) return "from-emerald-500 via-green-500 to-teal-500";
        if (analysis.confidence >= 50) return "from-amber-500 via-orange-500 to-yellow-500";
        return "from-red-500 via-rose-500 to-pink-500";
    };

    const config = getRecommendationConfig();

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50/50 via-white to-slate-50/30 dark:from-slate-900/50 dark:via-slate-800/50 dark:to-slate-900/30 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xl">
            {/* Decorative background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1DBF73]/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#1DBF73]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative p-8">
                {/* Header with glassmorphism */}
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl blur opacity-50" />
                            <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Brain className="w-7 h-7 text-white" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                                    AI Analysis Report
                                </h3>
                                <Sparkles className="w-4 h-4 text-indigo-500" />
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                Powered by Nugen Legal AI
                            </p>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`px-4 py-2 rounded-full ${config.bg} ${config.border} border backdrop-blur-sm`}>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${config.gradient} animate-pulse`} />
                            <span className={`text-sm font-semibold ${config.icon}`}>Active Analysis</span>
                        </div>
                    </div>
                </div>

                {/* Recommendation Card with glassmorphism */}
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 mb-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                        <CheckCircle2 className={`w-5 h-5 ${config.icon}`} />
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                            Recommendation
                        </span>
                    </div>
                    <div className={`text-4xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent mb-2`}>
                        {config.text}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <TrendingUp className="w-4 h-4" />
                        <span>Based on comprehensive analysis</span>
                    </div>
                </div>

                {/* Confidence Score */}
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 mb-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getConfidenceGradient()} flex items-center justify-center`}>
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                    Confidence Score
                                </div>
                                <div className={`text-3xl font-bold bg-gradient-to-r ${getConfidenceGradient()} bg-clip-text text-transparent`}>
                                    {analysis.confidence}%
                                </div>
                            </div>
                        </div>

                        {/* Confidence Level Badge */}
                        <div className={`px-4 py-2 rounded-full ${analysis.confidence >= 75 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400" :
                            analysis.confidence >= 50 ? "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400" :
                                "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"
                            } border font-semibold text-sm`}>
                            {analysis.confidence >= 75 ? "High" : analysis.confidence >= 50 ? "Medium" : "Low"}
                        </div>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="relative w-full h-3 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                        <div
                            className={`h-full rounded-full bg-gradient-to-r ${getConfidenceGradient()} shadow-lg transition-all duration-1000 ease-out relative overflow-hidden`}
                            style={{ width: `${analysis.confidence}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        </div>
                    </div>
                </div>

                {/* Summary Section */}
                <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-md rounded-2xl p-6 mb-6 border border-slate-700/50 shadow-xl">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1DBF73] to-purple-500 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-white">
                            Summary
                        </h4>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        {analysis.summary}
                    </p>
                </div>

                {/* Key Reasoning Points */}
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1DBF73] to-purple-500 flex items-center justify-center">
                            <AlertCircle className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                            Key Reasoning Points
                        </h4>
                    </div>
                    <div className="space-y-3">
                        {analysis.reasoning.map((point, index) => (
                            <div key={index} className="flex gap-3 group">
                                <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br from-[#1DBF73] to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                                    {index + 1}
                                </div>
                                <p className="flex-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-0.5">
                                    {point}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="mt-6 pt-5 border-t border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex gap-3">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                            This is an AI-generated analysis to assist human jurors. The final decision rests with the DAO jury.
                            AI recommendations are advisory and should be evaluated alongside human judgment.
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    );
}
