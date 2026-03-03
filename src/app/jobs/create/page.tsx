"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, decodeEventLog } from "viem";
import Navbar from "@/components/layout/Navbar";
import { ESCROW_ABI, USDC_ABI } from "@/lib/contracts";
import { ESCROW_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS } from "@/lib/wagmi";
import { supabase } from "@/lib/supabase";
import { Loader2, FileText, DollarSign, Calendar, Shield, CheckCircle, ArrowRight, Lock, Zap, AlertCircle } from "lucide-react";

export default function CreateJobPage() {
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const { writeContract, isPending: isWriting } = useWriteContract();

    const [formData, setFormData] = useState({ title: "", description: "", amount: "", deadline: "" });
    const [isUploading, setIsUploading] = useState(false);
    const [step, setStep] = useState<"form" | "approving" | "creating">("form");
    const [jobTxHash, setJobTxHash] = useState<`0x${string}` | undefined>();
    const [ipfsHashForJob, setIpfsHashForJob] = useState<string>("");

    const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: jobTxHash });

    useEffect(() => {
        const saveJobToDatabase = async () => {
            if (!receipt || !address || !ipfsHashForJob) return;
            try {
                const jobCreatedLog = receipt.logs.find((log) => {
                    try {
                        const decoded = decodeEventLog({ abi: ESCROW_ABI, data: log.data, topics: log.topics });
                        return decoded.eventName === "JobCreated";
                    } catch { return false; }
                });
                if (!jobCreatedLog) { alert("Job created on blockchain but couldn't find event."); return; }
                const decodedEvent = decodeEventLog({ abi: ESCROW_ABI, data: jobCreatedLog.data, topics: jobCreatedLog.topics });
                const jobId = (decodedEvent.args as Record<string, unknown>).jobId as bigint;
                const { error } = await supabase.from("jobs").insert({
                    contract_job_id: Number(jobId),
                    title: formData.title, description: formData.description,
                    description_ipfs: ipfsHashForJob,
                    amount: Number(parseUnits(formData.amount, 6)),
                    deadline: Math.floor(new Date(formData.deadline).getTime() / 1000),
                    client: address, status: "OPEN",
                });
                if (error) alert(`Failed to save: ${error.message}`);
                else { alert("✅ Job created successfully!"); setTimeout(() => router.push("/jobs"), 1000); }
            } catch (error) { console.error(error); }
        };
        saveJobToDatabase();
    }, [receipt, address, ipfsHashForJob, formData, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isConnected || !address) { alert("Please connect your wallet"); return; }
        try {
            setIsUploading(true);
            const uploadResponse = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jsonData: { title: formData.title, description: formData.description, createdBy: address, createdAt: Date.now() }, name: `job-${Date.now()}` }),
            });
            if (!uploadResponse.ok) { const e = await uploadResponse.json(); throw new Error(e.error); }
            const { ipfsHash } = await uploadResponse.json();
            setIsUploading(false);
            setStep("approving");
            const amountInWei = parseUnits(formData.amount, 6);
            writeContract({ address: USDC_CONTRACT_ADDRESS, abi: USDC_ABI, functionName: "approve", args: [ESCROW_CONTRACT_ADDRESS, amountInWei] }, {
                onSuccess: () => { setTimeout(() => { setStep("creating"); createJob(amountInWei, ipfsHash); }, 3000); },
            });
        } catch (error) { console.error(error); alert("Failed to create job."); setIsUploading(false); setStep("form"); }
    };

    const createJob = (amountInWei: bigint, ipfsHash: string) => {
        const deadlineTimestamp = Math.floor(new Date(formData.deadline).getTime() / 1000);
        setIpfsHashForJob(ipfsHash);
        writeContract({ address: ESCROW_CONTRACT_ADDRESS, abi: ESCROW_ABI, functionName: "createJob", args: [amountInWei, BigInt(deadlineTimestamp), ipfsHash] }, {
            onSuccess: (txHash) => { setJobTxHash(txHash); },
            onError: (error) => { alert(`Failed: ${error.message}`); setStep("form"); },
        });
    };

    const isLoading = isUploading || isWriting || isConfirming;
    const platformFee = (parseFloat(formData.amount || "0") * 0.025).toFixed(2);

    const inputClass = "w-full bg-[#111118] border border-[#1a1a24] rounded-xl text-[#f0f0f5] placeholder:text-[#8888a0] text-sm focus:outline-none focus:border-[#6366f1]/50 transition-colors disabled:opacity-50";

    return (
        <div className="min-h-screen bg-[#050505] text-[#f0f0f5]">
            <Navbar />

            <div className="max-w-screen-xl mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-light text-[#f0f0f5] mb-3">Post a New Job</h1>
                        <p className="text-[#8888a0] max-w-xl mx-auto">
                            Create a secure escrow contract and fund it with USDC. Your funds are locked until work is approved.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Form */}
                        <div className="lg:col-span-2">
                            <div className="rounded-2xl border border-[#1a1a24] bg-[#111118]/60 p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-[#f0f0f5] mb-2">Job Title *</label>
                                        <div className="relative">
                                            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888a0]" />
                                            <input
                                                type="text" placeholder='e.g., "Build a DeFi Dashboard"'
                                                value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                required disabled={isLoading}
                                                className={`${inputClass} pl-11 pr-4 py-3`}
                                            />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-[#f0f0f5] mb-2">Description *</label>
                                        <textarea
                                            placeholder="Detailed requirements, deliverables, and expectations..."
                                            value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            required disabled={isLoading} rows={6}
                                            className={`${inputClass} px-4 py-3 resize-none`}
                                        />
                                    </div>

                                    {/* Amount & Deadline */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-[#f0f0f5] mb-2">Budget (USDC) *</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888a0]" />
                                                <input
                                                    type="number" step="0.01" min="1" placeholder="500"
                                                    value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                    required disabled={isLoading}
                                                    className={`${inputClass} pl-11 pr-4 py-3`}
                                                />
                                            </div>
                                            <p className="text-xs text-[#8888a0] mt-2">Platform fee: 2.5% (${platformFee})</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#f0f0f5] mb-2">Deadline *</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8888a0]" />
                                                <input
                                                    type="datetime-local"
                                                    value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                                    required disabled={isLoading}
                                                    className={`${inputClass} pl-11 pr-4 py-3`}
                                                    style={{ colorScheme: "dark" }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <div className="pt-2">
                                        <button
                                            type="submit" disabled={isLoading || !isConnected}
                                            className="w-full py-4 bg-[#6366f1] text-white rounded-xl text-sm font-medium hover:bg-[#5254cc] transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    {step === "form" && "Uploading to IPFS..."}
                                                    {step === "approving" && "Approving USDC..."}
                                                    {step === "creating" && "Creating Job..."}
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    Create Job & Fund Escrow <ArrowRight className="w-4 h-4" />
                                                </span>
                                            )}
                                        </button>
                                        {!isConnected && (
                                            <div className="flex items-center justify-center gap-2 mt-4 text-amber-400">
                                                <AlertCircle className="w-4 h-4" />
                                                <p className="text-sm">Please connect your wallet to create a job</p>
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-5">
                            {/* How Escrow Works */}
                            <div className="rounded-2xl border border-[#1a1a24] bg-[#111118]/60 p-6">
                                <h3 className="font-medium text-[#f0f0f5] mb-4 text-sm">How Escrow Works</h3>
                                <div className="space-y-4">
                                    {[
                                        { icon: Lock, color: "bg-emerald-500/10 text-emerald-400", title: "USDC Locked in Contract", sub: "No one can access funds except the contract" },
                                        { icon: Shield, color: "bg-blue-500/10 text-blue-400", title: "Release on Approval", sub: "You approve when work is complete" },
                                        { icon: Zap, color: "bg-[#7c3aed]/10 text-violet-400", title: "Fair Dispute Resolution", sub: "AI + DAO jury if issues arise" },
                                    ].map((item) => (
                                        <div key={item.title} className="flex gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                                                <item.icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[#f0f0f5]">{item.title}</p>
                                                <p className="text-xs text-[#8888a0]">{item.sub}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Why FairWork */}
                            <div className="rounded-2xl border border-[#6366f1]/20 bg-gradient-to-br from-[#6366f1]/10 to-[#7c3aed]/5 p-6">
                                <h3 className="font-medium text-[#f0f0f5] mb-4 text-sm">Why Post on FairWork?</h3>
                                <ul className="space-y-2.5">
                                    {["Only 2.5% platform fee", "Web3-native talent pool", "On-chain payment security", "Instant USDC payments"].map((item) => (
                                        <li key={item} className="flex items-center gap-2 text-sm text-[#8888a0]">
                                            <CheckCircle className="w-4 h-4 text-[#6366f1] shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
