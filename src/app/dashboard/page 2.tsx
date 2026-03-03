"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import { Scale, Shield, Brain, Users, ArrowRight } from "lucide-react";

export default function HomePage() {
    return (
        <div className="min-h-screen">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
                <div className="absolute inset-0 bg-grid-pattern opacity-10" />

                <div className="relative container mx-auto px-6 py-24">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left: Value Proposition */}
                        <div>
                            <h1 className="text-5xl font-bold text-white leading-tight">
                                Fair escrow.<br />
                                <span className="text-indigo-400">Transparent arbitration.</span>
                            </h1>
                            <p className="text-lg text-slate-300 mt-6">
                                AI-powered dispute resolution with DAO governance.
                                No platform bias. No hidden fees. Built on Polygon for fast, affordable transactions.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex gap-4 mt-8">
                                <Link href="/jobs/create">
                                    <Button size="lg" className="gap-2">
                                        Post a Job
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                                <Link href="/jobs">
                                    <Button size="lg" variant="outline" className="bg-transparent text-white border-white/20 hover:bg-white/10">
                                        Browse Jobs
                                    </Button>
                                </Link>
                            </div>

                            {/* Trust Indicators */}
                            <div className="grid grid-cols-3 gap-6 mt-12">
                                <div>
                                    <div className="text-3xl font-bold text-white">2.5%</div>
                                    <div className="text-sm text-slate-400">Platform Fee</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-white">100%</div>
                                    <div className="text-sm text-slate-400">Transparent</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-white">3</div>
                                    <div className="text-sm text-slate-400">Jury Votes</div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Live Stats Card */}
                        <div className="relative">
                            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">How It Works</h3>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                            <span className="text-white font-bold">1</span>
                                        </div>
                                        <div>
                                            <div className="text-white font-medium">Create & Fund Escrow</div>
                                            <div className="text-sm text-slate-400">Client deposits USDC into smart contract</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                            <span className="text-white font-bold">2</span>
                                        </div>
                                        <div>
                                            <div className="text-white font-medium">Work & Deliver</div>
                                            <div className="text-sm text-slate-400">Freelancer completes work, uploads to IPFS</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                            <span className="text-white font-bold">3</span>
                                        </div>
                                        <div>
                                            <div className="text-white font-medium">Approve or Dispute</div>
                                            <div className="text-sm text-slate-400">Client reviews and releases funds or raises dispute</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                                            <span className="text-white font-bold">4</span>
                                        </div>
                                        <div>
                                            <div className="text-white font-medium">AI + DAO Resolution</div>
                                            <div className="text-sm text-slate-400">AI analyzes evidence, 3 jurors vote on outcome</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white dark:bg-slate-950">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                            Why FairWork?
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Traditional freelance platforms charge high fees and have opaque dispute processes.
                            FairWork brings transparency and fairness to the gig economy.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Feature 1 */}
                        <Card className="p-6 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
                            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                Smart Contract Escrow
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Funds locked in audited smart contracts. No platform can touch your money.
                            </p>
                        </Card>

                        {/* Feature 2 */}
                        <Card className="p-6 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
                            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                AI-Powered Analysis
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Nugen AI analyzes disputes objectively, providing data-driven recommendations.
                            </p>
                        </Card>

                        {/* Feature 3 */}
                        <Card className="p-6 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
                            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                DAO Jury System
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                3 random jurors vote on disputes. Decentralized decision-making.
                            </p>
                        </Card>

                        {/* Feature 4 */}
                        <Card className="p-6 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
                            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                                <Scale className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                Low Fees
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Only 2.5% platform fee. Polygon L2 means gas costs under $0.01.
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-br from-indigo-600 to-purple-700">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to experience fair freelancing?
                    </h2>
                    <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                        Connect your wallet and start posting jobs or finding work.
                        No signup required.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/jobs/create">
                            <Button size="lg" variant="outline" className="bg-white text-indigo-600 hover:bg-indigo-50 border-0">
                                Post Your First Job
                            </Button>
                        </Link>
                        <Link href="/jobs">
                            <Button size="lg" variant="outline" className="bg-transparent text-white border-white/30 hover:bg-white/10">
                                Explore Opportunities
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
