"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import AIAnalysisReport from "@/components/disputes/AIAnalysisReport";
import { AIAnalysis } from "@/types/dispute";
import {
    Brain, ArrowRight, ArrowLeft, Play, CheckCircle,
    Users, Briefcase, Zap, ChevronDown, ChevronUp,
    ShoppingCart, Palette, PenLine, AlertTriangle
} from "lucide-react";

const testScenarios = [
    {
        id: 1,
        name: "E-commerce Website",
        icon: ShoppingCart,
        description: "Missing critical features — Payment & Admin panel",
        expectedResult: "CLIENT",
        confidence: "~75%",
        jobDescription: `Build a responsive e-commerce website with the following features:
- Product catalog with search and filters
- Shopping cart functionality
- User authentication (login/signup)
- Payment integration with Stripe
- Admin dashboard for product management
- Mobile responsive design
- SEO optimization
Budget: $500, Deadline: 14 days`,
        deliverable: `Website deployed at demo-shop.vercel.app

Completed features:
- Product catalog with basic listing (no search/filters)
- Shopping cart (add/remove items)
- User authentication working
- Mobile responsive

NOT completed:
- Stripe payment integration (placeholder only)
- Admin dashboard (not implemented)
- SEO optimization (basic meta tags only)`,
        clientEvidence: `The freelancer delivered only 60% of the agreed scope. Critical features are missing:

1. Payment Integration: There is NO working Stripe integration, just a placeholder button.
2. Admin Dashboard: Completely absent.
3. Search/Filters: No search or filtering capability.
4. SEO: Only basic meta tags, no sitemap.

Requesting 50% refund for incomplete work.`,
        freelancerEvidence: `I delivered a fully functional e-commerce foundation within the tight 14-day deadline. The client is now adding scope. Payment integration and admin panel were discussed as "phase 2" in our initial chat.

I spent 80+ hours on this project. The core e-commerce functionality is there. Requesting full payment.`,
    },
    {
        id: 2,
        name: "Logo Design",
        icon: Palette,
        description: "Subjective style dispute — All requirements met",
        expectedResult: "FREELANCER",
        confidence: "~80%",
        jobDescription: `Design a modern logo for tech startup "CloudSync"
- Must include cloud and sync iconography
- Provide 3 initial concepts
- Deliver final logo in SVG, PNG, AI formats
- Include brand color palette
- Provide usage guidelines
Budget: $200, Timeline: 5 days`,
        deliverable: `Delivered 3 logo concepts as requested:
- Concept A: Minimalist cloud with circular arrows
- Concept B: Abstract cloud with data nodes
- Concept C: Geometric cloud with sync symbol

All concepts delivered in PNG, SVG, and AI formats with comprehensive brand guidelines.`,
        clientEvidence: `The logos look amateurish and don't match our vision. The cloud icons are too generic. We wanted something innovative and unique.

The colors are too bright for a B2B enterprise product. We need a complete redesign.`,
        freelancerEvidence: `I delivered exactly what was requested: 3 concepts, all file formats, and brand guidelines.

The client never provided style preferences or examples. I asked twice via messages but received no response. Design is subjective, but I met all objective requirements.`,
    },
    {
        id: 3,
        name: "Blog Writing",
        icon: PenLine,
        description: "Quality and originality dispute",
        expectedResult: "NEUTRAL",
        confidence: "~65%",
        jobDescription: `Write 10 SEO-optimized blog posts about cryptocurrency investing
- Each post: 1500-2000 words
- Include relevant keywords
- Proper formatting with H2/H3 headings
- Add meta descriptions
- Cite credible sources
Budget: $300, Deadline: 10 days`,
        deliverable: `Delivered 10 blog posts, each 1800-2000 words with SEO keywords, H2/H3 headings, meta descriptions, and 3-5 credible sources per article.`,
        clientEvidence: `The content is AI-generated garbage. I can tell from repetitive phrasing. Some articles have factual errors about crypto regulations.

Refusing payment until completely rewritten by a human writer.`,
        freelancerEvidence: `I wrote every article myself. I'm a professional crypto writer with 3 years of experience.

I can provide Copyscape reports proving zero plagiarism. The client is making baseless accusations to get free work.`,
    },
];

const resultColors: Record<string, string> = {
    CLIENT: "bg-red-500/10 text-red-400 border border-red-500/20",
    FREELANCER: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    NEUTRAL: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
};

const stats = [
    { value: "3", label: "Test Scenarios" },
    { value: "<10s", label: "Analysis Time" },
    { value: "85%", label: "Avg Confidence" },
    { value: "Free", label: "No USDC Needed" },
];

export default function TestAIPage() {
    const [selectedScenario, setSelectedScenario] = useState(testScenarios[0]);
    const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    const analyzeDispute = async () => {
        setLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const response = await fetch("/api/ai/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jobDescription: selectedScenario.jobDescription,
                    deliverable: selectedScenario.deliverable,
                    clientEvidence: selectedScenario.clientEvidence,
                    freelancerEvidence: selectedScenario.freelancerEvidence,
                }),
            });
            const data = await response.json();
            if (data.success) setAnalysis(data.analysis);
            else setError(data.error || "Analysis failed");
        } catch {
            setError("Failed to connect to AI service");
        } finally {
            setLoading(false);
        }
    };

    const SelectedIcon = selectedScenario.icon;

    return (
        <div className="min-h-screen bg-backdrop text-text-primary">
            <Navbar />

            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image src="/images/hero.png" alt="AI Dispute Resolution" fill className="object-cover opacity-25" priority />
                    <div className="absolute inset-0 bg-gradient-to-r from-backdrop/95 via-backdrop/70 to-transparent" />
                </div>

                <div className="relative z-10 max-w-[1600px] mx-auto px-6 py-24 lg:py-36">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="max-w-2xl"
                    >
                        <div className="inline-flex items-center gap-2 bg-accent-indigo/10 border border-accent-indigo/20 rounded-full px-4 py-2 mb-6">
                            <Brain className="w-4 h-4 text-accent-indigo" />
                            <span className="text-text-primary/80 text-sm font-medium">AI Demo · No USDC Required</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light font-bold text-text-primary mb-6 leading-[1.1]">
                            Experience{" "}
                            <span className="bg-gradient-to-r from-accent-indigo to-accent-violet bg-clip-text text-transparent">
                                AI-Powered
                            </span>{" "}
                            Dispute Resolution
                        </h1>

                        <p className="text-lg text-text-muted mb-8 leading-relaxed">
                            Test our intelligent dispute analysis with realistic scenarios.
                            See how AI provides fair, objective recommendations.
                        </p>

                        <div className="flex flex-wrap gap-4 mb-8">
                            <button
                                onClick={() => document.getElementById("scenarios")?.scrollIntoView({ behavior: "smooth" })}
                                className="flex items-center gap-2 px-6 py-3 bg-accent-indigo text-white rounded-xl text-sm font-medium hover:bg-accent-indigo/90 transition-all shadow-glow-sm"
                            >
                                <Play className="w-4 h-4" /> Try Demo Now
                            </button>
                            <Link href="/disputes"
                                className="flex items-center gap-2 px-6 py-3 border border-surface-border text-text-muted rounded-xl text-sm font-medium hover:border-accent-indigo/30 hover:text-text-primary transition-all">
                                <ArrowLeft className="w-4 h-4" /> View Disputes
                            </Link>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-text-muted text-sm">Features:</span>
                            {["GPT-4 Analysis", "Instant Results", "Free Demo"].map((tag) => (
                                <span key={tag} className="px-4 py-1.5 bg-surface-elevated border border-surface-border rounded-full text-sm text-text-muted">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-backdrop to-transparent z-10" />
            </section>

            {/* Stats */}
            <section className="border-y border-surface-border py-8">
                <div className="max-w-[1600px] mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((stat) => (
                            <div key={stat.label}>
                                <div className="text-3xl font-light bg-gradient-to-r from-accent-indigo to-accent-violet bg-clip-text text-transparent mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-text-muted text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Scenarios */}
            <section id="scenarios" className="py-16 border-t border-surface-border">
                <div className="max-w-[1600px] mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-light font-bold text-text-primary mb-4">
                            Choose a Test Scenario
                        </h2>
                        <p className="text-text-muted max-w-2xl mx-auto">
                            Select from realistic dispute scenarios to see how our AI provides fair, detailed analysis
                        </p>
                    </motion.div>

                    {/* Scenario Cards */}
                    <div className="grid md:grid-cols-3 gap-6 mb-10">
                        {testScenarios.map((scenario, i) => {
                            const ScenarioIcon = scenario.icon;
                            return (
                            <motion.button
                                key={scenario.id}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: i * 0.07, ease: "easeOut" }}
                                onClick={() => { setSelectedScenario(scenario); setAnalysis(null); setError(null); setShowDetails(false); }}
                                className={`group text-left p-6 rounded-2xl border transition-all duration-300 ${
                                    selectedScenario.id === scenario.id
                                        ? "border-accent-indigo bg-accent-indigo/8 shadow-glow-sm"
                                        : "border-surface-border bg-surface-elevated/60 hover:border-accent-indigo/30 hover:shadow-card-hover"
                                }`}
                            >
                                <div className="mb-4 w-10 h-10 rounded-xl bg-accent-indigo/10 flex items-center justify-center">
                                    <ScenarioIcon className="w-5 h-5 text-accent-indigo" />
                                </div>
                                <h3 className={`font-semibold font-bold mb-2 transition-colors ${
                                    selectedScenario.id === scenario.id ? "text-accent-indigo" : "text-text-primary group-hover:text-accent-indigo"
                                }`}>
                                    {scenario.name}
                                </h3>
                                <p className="text-text-muted text-sm mb-4">{scenario.description}</p>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${resultColors[scenario.expectedResult]}`}>
                                        {scenario.expectedResult}
                                    </span>
                                    <span className="text-xs text-text-subtle">{scenario.confidence}</span>
                                </div>
                            </motion.button>
                        ); })}
                    </div>

                    {/* Selected Scenario Panel */}
                    <motion.div
                        key={selectedScenario.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="rounded-2xl border border-surface-border bg-surface-elevated/60 p-8 md:p-10 mb-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-accent-indigo/10 border border-accent-indigo/20 rounded-2xl flex items-center justify-center">
                                    <SelectedIcon className="w-7 h-7 text-accent-indigo" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold font-bold text-text-primary">{selectedScenario.name}</h3>
                                    <p className="text-text-muted text-sm">Scenario #{selectedScenario.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className="flex items-center gap-1.5 text-[#1DBF73] text-sm font-medium hover:text-[#19A463] transition-colors"
                            >
                                {showDetails ? <><ChevronUp className="w-4 h-4" /> Hide Details</> : <><ChevronDown className="w-4 h-4" /> View Full Details</>}
                            </button>
                        </div>

                        <AnimatePresence>
                            {showDetails && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-6 mb-8">
                                        <div>
                                            <h4 className="font-semibold font-bold text-text-primary mb-2 flex items-center gap-2 text-sm">
                                                <Briefcase className="w-4 h-4 text-accent-indigo" /> Job Description
                                            </h4>
                                            <div className="bg-surface border border-surface-border p-4 rounded-xl text-sm text-text-muted whitespace-pre-wrap leading-relaxed">
                                                {selectedScenario.jobDescription}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold font-bold text-text-primary mb-2 flex items-center gap-2 text-sm">
                                                <CheckCircle className="w-4 h-4 text-blue-400" /> Deliverable
                                            </h4>
                                            <div className="bg-blue-500/5 border border-blue-500/15 p-4 rounded-xl text-sm text-text-muted whitespace-pre-wrap leading-relaxed">
                                                {selectedScenario.deliverable}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="font-semibold font-bold text-red-400 mb-2 flex items-center gap-2 text-sm">
                                                    <Users className="w-4 h-4" /> Client&apos;s Evidence
                                                </h4>
                                                <div className="bg-red-500/5 border border-red-500/15 p-4 rounded-xl text-sm text-text-muted whitespace-pre-wrap leading-relaxed h-48 overflow-y-auto">
                                                    {selectedScenario.clientEvidence}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold font-bold text-emerald-400 mb-2 flex items-center gap-2 text-sm">
                                                    <Users className="w-4 h-4" /> Freelancer&apos;s Evidence
                                                </h4>
                                                <div className="bg-emerald-500/5 border border-emerald-500/15 p-4 rounded-xl text-sm text-text-muted whitespace-pre-wrap leading-relaxed h-48 overflow-y-auto">
                                                    {selectedScenario.freelancerEvidence}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="text-center pt-2">
                            <button
                                onClick={analyzeDispute}
                                disabled={loading}
                                className="inline-flex items-center gap-3 px-10 py-4 bg-accent-indigo text-white rounded-xl text-base font-medium hover:bg-accent-indigo/90 transition-all shadow-glow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        AI is Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Brain className="w-5 h-5" /> Analyze with AI <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>

                    {/* Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 mb-8"
                        >
                            <div className="flex items-center gap-3 text-red-400">
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                                <div>
                                    <div className="font-semibold">Analysis Failed</div>
                                    <div className="text-sm text-red-400/70 mt-0.5">{error}</div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* AI Result */}
                    {analysis && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            <div className="rounded-2xl border border-surface-border bg-surface-elevated/60 p-8 md:p-10">
                                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-surface-border">
                                    <div className="w-14 h-14 bg-gradient-to-br from-accent-indigo to-accent-violet rounded-2xl flex items-center justify-center shadow-glow-md">
                                        <Brain className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold font-bold text-text-primary">AI Analysis Complete</h2>
                                        <p className="text-text-muted text-sm">Powered by OpenAI GPT-4</p>
                                    </div>
                                    <div className="ml-auto">
                                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                                    </div>
                                </div>
                                <AIAnalysisReport analysis={analysis!} />
                            </div>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 border-t border-surface-border">
                <div className="max-w-[1600px] mx-auto px-6">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-light font-bold text-text-primary mb-4">
                            How AI Dispute Resolution Works
                        </h2>
                        <p className="text-text-muted max-w-2xl mx-auto">
                            Fair, transparent, and fast resolution powered by AI and community governance
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8 relative">
                        <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-px bg-gradient-to-r from-accent-indigo/30 via-accent-violet/30 to-accent-indigo/30" />
                        {[
                            { title: "Submit Evidence", desc: "Both parties provide their side", icon: Briefcase },
                            { title: "AI Analysis", desc: "GPT-4 evaluates objectively", icon: Brain },
                            { title: "DAO Voting", desc: "Community jurors review", icon: Users },
                            { title: "Resolution", desc: "Funds released fairly", icon: Zap },
                        ].map((item, i) => (
                            <div key={item.title} className="text-center relative">
                                <motion.div
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.35, delay: i * 0.08, ease: "easeOut" }}
                                >
                                    <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-accent-indigo to-accent-violet text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-sm">
                                        <item.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="font-medium font-bold text-text-primary mb-2">{item.title}</h3>
                                    <p className="text-text-muted text-sm">{item.desc}</p>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 border-t border-surface-border">
                <div className="max-w-[1600px] mx-auto px-6 text-center relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-accent-indigo/10 rounded-full blur-3xl pointer-events-none" />
                    <h2 className="relative text-3xl md:text-5xl font-light font-bold text-text-primary mb-6">
                        Ready to use FairWork?
                    </h2>
                    <p className="text-text-muted mb-10 max-w-xl mx-auto text-lg">
                        Connect your wallet and experience the fairest freelance platform.
                        AI-powered dispute resolution included.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link href="/disputes"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent-indigo text-white rounded-xl text-sm font-medium hover:bg-accent-indigo/90 transition-all shadow-glow-sm">
                            View Dispute Center <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="/"
                            className="inline-flex items-center gap-2 px-8 py-3.5 border border-surface-border text-text-muted rounded-xl text-sm font-medium hover:border-accent-indigo/30 hover:text-text-primary transition-all">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
