"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, decodeEventLog } from "viem";
import Navbar from "@/components/layout/Navbar";
import { ESCROW_ABI, USDC_ABI } from "@/lib/contracts";
import { ESCROW_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS } from "@/lib/wagmi";
import { uploadJSONToPinata } from "@/lib/pinata";
import { supabase } from "@/lib/supabase";
import {
    Loader2, FileText, DollarSign, Calendar, Shield,
    CheckCircle, ArrowRight, Lock, Zap, AlertCircle
} from "lucide-react";

export default function CreateJobPage() {
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const { writeContract, data: hash, isPending: isWriting } = useWriteContract();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        amount: "",
        deadline: "",
    });

    const [isUploading, setIsUploading] = useState(false);
    const [step, setStep] = useState<"form" | "approving" | "creating">("form");
    const [jobTxHash, setJobTxHash] = useState<`0x${string}` | undefined>();
    const [ipfsHashForJob, setIpfsHashForJob] = useState<string>("");

    // Wait for job creation transaction
    const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt({
        hash: jobTxHash,
    });

    // When transaction is confirmed, parse the event and save to database
    useEffect(() => {
        const saveJobToDatabase = async () => {
            if (!receipt || !address || !ipfsHashForJob) return;

            try {
                // Find the JobCreated event in the logs
                const jobCreatedLog = receipt.logs.find((log) => {
                    try {
                        const decoded = decodeEventLog({
                            abi: ESCROW_ABI,
                            data: log.data,
                            topics: log.topics,
                        });
                        return decoded.eventName === 'JobCreated';
                    } catch {
                        return false;
                    }
                });

                if (!jobCreatedLog) {
                    console.error("JobCreated event not found in transaction logs");
                    alert("Job created on blockchain but couldn't find event. Please refresh the page.");
                    return;
                }

                // Decode the event to get the jobId
                const decodedEvent = decodeEventLog({
                    abi: ESCROW_ABI,
                    data: jobCreatedLog.data,
                    topics: jobCreatedLog.topics,
                });

                const jobId = (decodedEvent.args as any).jobId as bigint;

                console.log("✅ Real Job ID from event:", jobId.toString());

                // Save to Supabase with the REAL job ID
                const { error } = await supabase.from("jobs").insert({
                    contract_job_id: Number(jobId),
                    title: formData.title,
                    description: formData.description,
                    description_ipfs: ipfsHashForJob,
                    amount: Number(parseUnits(formData.amount, 6)),
                    deadline: Math.floor(new Date(formData.deadline).getTime() / 1000),
                    client: address,
                    status: "OPEN",
                });

                if (error) {
                    console.error("Database insert error:", error);
                    alert(`Job created on blockchain but database save failed: ${error.message}`);
                } else {
                    console.log("✅ Job saved to database successfully!");
                    alert("✅ Job created successfully!");
                    setTimeout(() => {
                        router.push("/jobs");
                    }, 1000);
                }
            } catch (error) {
                console.error("Error saving job to database:", error);
                alert("Job created on blockchain but failed to save to database. Please contact support.");
            }
        };

        saveJobToDatabase();
    }, [receipt, address, ipfsHashForJob, formData, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConnected || !address) {
            alert("Please connect your wallet");
            return;
        }


        try {
            setIsUploading(true);

            // 1. Upload job description to IPFS via API
            const jobData = {
                title: formData.title,
                description: formData.description,
                createdBy: address,
                createdAt: Date.now(),
            };

            const uploadResponse = await fetch("/api/upload", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    jsonData: jobData,
                    name: `job-${Date.now()}`,
                }),
            });

            if (!uploadResponse.ok) {
                const error = await uploadResponse.json();
                throw new Error(error.error || "Failed to upload to IPFS");
            }

            const { ipfsHash } = await uploadResponse.json();
            console.log("Job description uploaded to IPFS:", ipfsHash);

            setIsUploading(false);

            // 2. Approve USDC spending
            setStep("approving");
            const amountInWei = parseUnits(formData.amount, 6);

            writeContract({
                address: USDC_CONTRACT_ADDRESS,
                abi: USDC_ABI,
                functionName: "approve",
                args: [ESCROW_CONTRACT_ADDRESS, amountInWei],
            }, {
                onSuccess: () => {
                    setTimeout(() => {
                        setStep("creating");
                        createJob(amountInWei, ipfsHash);
                    }, 3000);
                },
            });

        } catch (error) {
            console.error("Error creating job:", error);
            alert("Failed to create job. See console for details.");
            setIsUploading(false);
            setStep("form");
        }
    };


    const createJob = (amountInWei: bigint, ipfsHash: string) => {
        const deadlineTimestamp = Math.floor(new Date(formData.deadline).getTime() / 1000);

        // Store IPFS hash for later use in useEffect
        setIpfsHashForJob(ipfsHash);

        writeContract({
            address: ESCROW_CONTRACT_ADDRESS,
            abi: ESCROW_ABI,
            functionName: "createJob",
            args: [amountInWei, BigInt(deadlineTimestamp), ipfsHash],
        }, {
            onSuccess: (txHash) => {
                console.log("✅ Job creation transaction sent:", txHash);
                console.log("⏳ Waiting for confirmation...");

                // Store the transaction hash to trigger receipt watching
                setJobTxHash(txHash);

                // Note: Database save happens in useEffect after receipt is confirmed
            },
            onError: (error) => {
                console.error("❌ Transaction failed:", error);
                alert(`Failed to create job: ${error.message}`);
                setStep("form");
            }
        });
    };

    const isLoading = isUploading || isWriting || isConfirming;
    const platformFee = (parseFloat(formData.amount || "0") * 0.025).toFixed(2);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container-custom py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">
                            Post a New Job
                        </h1>
                        <p className="text-gray-600 text-lg max-w-xl mx-auto">
                            Create a secure escrow contract and fund it with USDC.
                            Your funds are locked until work is approved.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Job Title *
                                        </label>
                                        <div className="relative">
                                            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="e.g., Build a DeFi Dashboard"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                required
                                                disabled={isLoading}
                                                className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1DBF73]/20 focus:border-[#1DBF73] transition-all disabled:opacity-50"
                                            />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Description *
                                        </label>
                                        <textarea
                                            placeholder="Detailed requirements, deliverables, and expectations..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            required
                                            disabled={isLoading}
                                            rows={6}
                                            className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1DBF73]/20 focus:border-[#1DBF73] transition-all disabled:opacity-50 resize-none"
                                        />
                                    </div>

                                    {/* Amount & Deadline Row */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Amount */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                Budget (USDC) *
                                            </label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="1"
                                                    placeholder="500"
                                                    value={formData.amount}
                                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                    required
                                                    disabled={isLoading}
                                                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1DBF73]/20 focus:border-[#1DBF73] transition-all disabled:opacity-50"
                                                />
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2">
                                                Fee: 2.5% (${platformFee})
                                            </p>
                                        </div>

                                        {/* Deadline */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                Deadline *
                                            </label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="datetime-local"
                                                    value={formData.deadline}
                                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                                    required
                                                    disabled={isLoading}
                                                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1DBF73]/20 focus:border-[#1DBF73] transition-all disabled:opacity-50"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={isLoading || !isConnected}
                                            className="w-full btn-primary py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    {step === "form" && "Uploading to IPFS..."}
                                                    {step === "approving" && "Approving USDC..."}
                                                    {step === "creating" && "Creating Job..."}
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    Create Job & Fund Escrow
                                                    <ArrowRight className="w-5 h-5" />
                                                </span>
                                            )}
                                        </button>

                                        {!isConnected && (
                                            <div className="flex items-center justify-center gap-2 mt-4 text-amber-600">
                                                <AlertCircle className="w-4 h-4" />
                                                <p className="text-sm">Please connect your wallet to create a job</p>
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* How It Works */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4">How Escrow Works</h3>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                            <Lock className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">USDC Locked in Contract</p>
                                            <p className="text-xs text-gray-500">No one can access funds except the contract</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <Shield className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Release on Approval</p>
                                            <p className="text-xs text-gray-500">You approve when work is complete</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                            <Zap className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Fair Dispute Resolution</p>
                                            <p className="text-xs text-gray-500">AI + DAO jury if issues arise</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="bg-gradient-to-br from-[#003912] to-[#00541a] rounded-2xl p-6 text-white">
                                <h3 className="font-bold mb-3">Why Post on FairWork?</h3>
                                <ul className="space-y-2 text-sm text-green-100">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        Only 2.5% platform fee
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        Web3-native talent pool
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        On-chain payment security
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        Instant USDC payments
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
