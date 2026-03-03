"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import AIAnalysisReport from "@/components/disputes/AIAnalysisReport";
import { AIAnalysis } from "@/types/dispute";
import {
    Brain, ArrowRight, ArrowLeft, Play, CheckCircle,
    Users, Briefcase, Zap
} from "lucide-react";

// Test scenarios data
const testScenarios = [
    {
        id: 1,
        name: "E-commerce Website",
        icon: "🛒",
        description: "Missing critical features - Payment & Admin panel",
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
        icon: "🎨",
        description: "Subjective style dispute - All requirements met",
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
        icon: "✍️",
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

            if (data.success) {
                setAnalysis(data.analysis);
            } else {
                setError(data.error || "Analysis failed");
            }
        } catch {
            setError("Failed to connect to AI service");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section - Matching Homepage */}
            <section className="relative overflow-hidden">
                {/* Background with gradient overlay - same as homepage */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/hero.png"
                        alt="AI Dispute Resolution"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#003912]/95 via-[#003912]/80 to-transparent" />
                </div>

                <div className="relative z-10 container-custom py-20 lg:py-28">
                    <div className="max-w-2xl">
                        {/* Badge */}
                        <div className="animate-fade-in inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                            <Brain className="w-4 h-4 text-green-400" />
                            <span className="text-white/90 text-sm font-medium">AI Demo • No USDC Required</span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="animate-fade-in-up text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-[1.1]">
                            Experience{" "}
                            <span className="text-gradient">AI-Powered</span>{" "}
                            Dispute Resolution
                        </h1>

                        <p className="animate-fade-in-up animate-fade-in-delay-1 text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
                            Test our intelligent dispute analysis with realistic scenarios.
                            See how AI provides fair, objective recommendations.
                        </p>

                        {/* CTA Buttons */}
                        <div className="animate-fade-in-up animate-fade-in-delay-2 flex flex-wrap gap-4">
                            <button
                                onClick={() => document.getElementById("scenarios")?.scrollIntoView({ behavior: "smooth" })}
                                className="btn-primary flex items-center gap-2"
                            >
                                <Play className="w-5 h-5" />
                                Try Demo Now
                            </button>
                            <Link href="/disputes" className="btn-outline !border-white/30 !text-white hover:!bg-white/10 flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                View Disputes
                            </Link>
                        </div>

                        {/* Tags - Same style as homepage */}
                        <div className="animate-fade-in-up animate-fade-in-delay-3 flex flex-wrap items-center gap-3 mt-8">
                            <span className="text-gray-400 text-sm">Features:</span>
                            {["GPT-4 Analysis", "Instant Results", "Free Demo"].map((tag) => (
                                <span
                                    key={tag}
                                    className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm text-white"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom fade - same as homepage */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent z-10" />
            </section>

            {/* Stats Section - Matching Homepage */}
            <section className="py-10 bg-white">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: "3", label: "Test Scenarios" },
                            { value: "<10s", label: "Analysis Time" },
                            { value: "85%", label: "Avg Confidence" },
                            { value: "Free", label: "No USDC Needed" },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-gray-500 text-sm">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Scenarios Section - Clean White */}
            <section id="scenarios" className="py-16 bg-white border-t border-gray-100">
                <div className="container-custom">
                    {/* Section Header */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Choose a Test Scenario
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Select from realistic dispute scenarios to see how our AI provides fair, detailed analysis
                        </p>
                    </div>

                    {/* Scenario Cards - Minimal style like homepage categories */}
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        {testScenarios.map((scenario) => (
                            <button
                                key={scenario.id}
                                onClick={() => {
                                    setSelectedScenario(scenario);
                                    setAnalysis(null);
                                    setError(null);
                                    setShowDetails(false);
                                }}
                                className={`minimal-card group text-left ${selectedScenario.id === scenario.id
                                    ? "!border-[#6B5DD3] !shadow-lg !shadow-purple-100"
                                    : ""
                                    }`}
                            >
                                <div className="text-4xl mb-4">{scenario.icon}</div>
                                <h3 className={`font-semibold mb-2 transition-colors ${selectedScenario.id === scenario.id
                                    ? "text-[#6B5DD3]"
                                    : "text-gray-900 group-hover:text-[#6B5DD3]"
                                    }`}>
                                    {scenario.name}
                                </h3>
                                <p className="text-gray-500 text-sm mb-4">{scenario.description}</p>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${scenario.expectedResult === "CLIENT"
                                        ? "bg-red-100 text-red-700"
                                        : scenario.expectedResult === "FREELANCER"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-yellow-100 text-yellow-700"
                                        }`}>
                                        {scenario.expectedResult}
                                    </span>
                                    <span className="text-xs text-gray-400">{scenario.confidence}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Selected Scenario Panel */}
                    <div className="bg-gray-50 rounded-3xl p-8 md:p-10 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                                    {selectedScenario.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedScenario.name}</h3>
                                    <p className="text-gray-500 text-sm">Scenario #{selectedScenario.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className="text-[#6B5DD3] font-semibold text-sm hover:underline"
                            >
                                {showDetails ? "Hide Details" : "View Full Details"}
                            </button>
                        </div>

                        {showDetails && (
                            <div className="space-y-6 mb-8 animate-fade-in">
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-[#6B5DD3]" />
                                        Job Description
                                    </h4>
                                    <div className="bg-white p-4 rounded-xl text-sm text-gray-700 whitespace-pre-wrap border border-gray-200">
                                        {selectedScenario.jobDescription}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-blue-500" />
                                        Deliverable
                                    </h4>
                                    <div className="bg-blue-50 p-4 rounded-xl text-sm text-gray-700 whitespace-pre-wrap border border-blue-100">
                                        {selectedScenario.deliverable}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            Client&apos;s Evidence
                                        </h4>
                                        <div className="bg-red-50 p-4 rounded-xl text-sm text-gray-700 whitespace-pre-wrap border border-red-100 h-48 overflow-y-auto">
                                            {selectedScenario.clientEvidence}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            Freelancer&apos;s Evidence
                                        </h4>
                                        <div className="bg-green-50 p-4 rounded-xl text-sm text-gray-700 whitespace-pre-wrap border border-green-100 h-48 overflow-y-auto">
                                            {selectedScenario.freelancerEvidence}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Analyze Button */}
                        <div className="text-center">
                            <button
                                onClick={analyzeDispute}
                                disabled={loading}
                                className="btn-primary !px-10 !py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-3">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        AI is Analyzing...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Brain className="w-5 h-5" />
                                        Analyze with AI
                                        <ArrowRight className="w-5 h-5" />
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 animate-fade-in">
                            <div className="flex items-center gap-3 text-red-700">
                                <span className="text-2xl">⚠️</span>
                                <div>
                                    <div className="font-semibold">Analysis Failed</div>
                                    <div className="text-sm">{error}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI Analysis Result */}
                    {analysis && (
                        <div className="animate-fade-in-up">
                            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 md:p-10">
                                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                                    <div className="w-14 h-14 bg-gradient-to-br from-[#6B5DD3] to-[#8B7FE8] rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
                                        <Brain className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">AI Analysis Complete</h2>
                                        <p className="text-gray-500">Powered by OpenAI GPT-4</p>
                                    </div>
                                    <div className="ml-auto">
                                        <CheckCircle className="w-8 h-8 text-green-500" />
                                    </div>
                                </div>
                                <AIAnalysisReport analysis={analysis} />
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* How It Works - Matching Homepage */}
            <section className="py-20 bg-gray-50">
                <div className="container-custom">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            How AI Dispute Resolution Works
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Fair, transparent, and fast resolution powered by AI and community governance
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8 relative">
                        {/* Connection Line */}
                        <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-[#6B5DD3] via-[#8B7FE8] to-[#6B5DD3]" />

                        {[
                            { step: "1", title: "Submit Evidence", desc: "Both parties provide their side", icon: Briefcase },
                            { step: "2", title: "AI Analysis", desc: "GPT-4 evaluates objectively", icon: Brain },
                            { step: "3", title: "DAO Voting", desc: "Community jurors review", icon: Users },
                            { step: "4", title: "Resolution", desc: "Funds released fairly", icon: Zap },
                        ].map((item) => (
                            <div key={item.step} className="text-center relative">
                                <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-[#6B5DD3] to-[#8B7FE8] text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-200">
                                    <item.icon className="w-7 h-7" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-500 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section - Matching Homepage */}
            <section className="py-20 gradient-hero relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
                </div>

                <div className="relative container-custom text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Ready to use FairWork?
                    </h2>
                    <p className="text-gray-300 mb-10 max-w-xl mx-auto text-lg">
                        Connect your wallet and experience the fairest freelance platform.
                        AI-powered dispute resolution included.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link href="/disputes" className="btn-primary !bg-white !text-[#003912] hover:!bg-gray-100 flex items-center gap-2">
                            View Dispute Center <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="/" className="btn-outline !border-white !text-white hover:!bg-white/10">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
