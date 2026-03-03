"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ESCROW_ABI } from "@/lib/contracts";
import { ESCROW_CONTRACT_ADDRESS } from "@/lib/wagmi";
import { supabase } from "@/lib/supabase";
import { formatUSDC, formatAddress, getIPFSUrl } from "@/lib/utils";
import { Loader2, ExternalLink, Upload, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
    description_ipfs?: string;
    deliverable_ipfs?: string;
}

export default function JobDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const { writeContract, isPending } = useWriteContract();

    const [job, setJob] = useState<Job | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [deliverableFile, setDeliverableFile] = useState<File | null>(null);
    const [disputeReason, setDisputeReason] = useState("");
    const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
    const [showDisputeForm, setShowDisputeForm] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | undefined>();
    const [pendingAction, setPendingAction] = useState<string | null>(null);

    // Wait for ANY transaction confirmation
    const { data: txReceipt } = useWaitForTransactionReceipt({
        hash: pendingTxHash,
    });

    const fetchJob = async () => {
        const { data, error } = await supabase
            .from("jobs")
            .select("*")
            .eq("id", params.id)
            .single();

        if (error) {
            console.error("Error fetching job:", error);
        } else {
            setJob(data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchJob();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    // Handle transaction confirmation for ALL actions
    useEffect(() => {
        const handleTxConfirmation = async () => {
            if (!txReceipt || !pendingAction || !job) return;

            console.log(`📝 [${pendingAction}] Transaction receipt:`, txReceipt);

            if (txReceipt.status === "success") {
                console.log(`✅ [${pendingAction}] Transaction confirmed!`);

                switch (pendingAction) {
                    case "cancel":
                        await supabase.from("jobs").update({ status: "CANCELLED" }).eq("id", job.id);
                        setShowCancelDialog(false);
                        setIsCancelling(false);
                        alert("✅ Job cancelled successfully! Refund sent to your wallet.");
                        router.push("/jobs");
                        break;

                    case "accept":
                        await supabase.from("jobs").update({ freelancer: address, status: "ACCEPTED" }).eq("id", job.id);
                        alert("✅ Job accepted successfully!");
                        fetchJob();
                        break;

                    case "approve":
                        await supabase.from("jobs").update({ status: "APPROVED" }).eq("id", job.id);
                        alert("✅ Job approved! Funds released to freelancer.");
                        fetchJob();
                        break;

                    case "submit":
                        await supabase.from("jobs").update({ status: "SUBMITTED" }).eq("id", job.id);
                        alert("✅ Deliverable submitted successfully!");
                        fetchJob();
                        break;

                    case "dispute":
                        await supabase.from("jobs").update({ status: "DISPUTED" }).eq("id", job.id);
                        alert("✅ Dispute raised successfully!");
                        router.push("/disputes");
                        break;
                }
            } else {
                console.error(`❌ [${pendingAction}] Transaction FAILED on-chain!`);
                alert(`❌ Transaction failed on-chain! The ${pendingAction} was NOT processed.\n\nCheck the transaction on Polygonscan for details.`);
                setIsCancelling(false);
                setShowCancelDialog(false);
            }

            // Reset pending state
            setPendingTxHash(undefined);
            setPendingAction(null);
        };

        handleTxConfirmation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [txReceipt]);

    const handleAcceptJob = () => {
        if (!job) return;

        writeContract({
            address: ESCROW_CONTRACT_ADDRESS,
            abi: ESCROW_ABI,
            functionName: "acceptJob",
            args: [BigInt(job.contract_job_id)],
        }, {
            onSuccess: (txHash) => {
                console.log("✅ Accept tx sent:", txHash);
                setPendingTxHash(txHash);
                setPendingAction("accept");
            },
            onError: (error: Error) => {
                console.error("❌ Accept job error:", error);
                alert(`❌ Failed to accept job: ${error.message}`);
            },
        });
    };

    const handleSubmitDeliverable = async () => {
        if (!deliverableFile || !job) return;

        try {
            // Upload to IPFS
            const formData = new FormData();
            formData.append("file", deliverableFile);

            const response = await fetch("/api/ipfs/upload", {
                method: "POST",
                body: formData,
            });

            const { ipfsHash } = await response.json();

            // Submit to contract
            writeContract({
                address: ESCROW_CONTRACT_ADDRESS,
                abi: ESCROW_ABI,
                functionName: "submitDeliverable",
                args: [BigInt(job.contract_job_id), ipfsHash],
            }, {
                onSuccess: async (txHash) => {
                    console.log("✅ Submit deliverable tx sent:", txHash);
                    // Save IPFS hash to database immediately (this is safe, it's just metadata)
                    await supabase
                        .from("jobs")
                        .update({ deliverable_ipfs: ipfsHash })
                        .eq("id", job.id);
                    setPendingTxHash(txHash);
                    setPendingAction("submit");
                },
                onError: (error: Error) => {
                    console.error("❌ Submit deliverable error:", error);
                    alert(`❌ Failed to submit deliverable: ${error.message}`);
                },
            });
        } catch (error) {
            console.error("Error submitting deliverable:", error);
            alert("Failed to submit deliverable");
        }
    };

    const handleApproveJob = () => {
        if (!job) return;

        writeContract({
            address: ESCROW_CONTRACT_ADDRESS,
            abi: ESCROW_ABI,
            functionName: "approveJob",
            args: [BigInt(job.contract_job_id)],
        }, {
            onSuccess: (txHash) => {
                console.log("✅ Approve tx sent:", txHash);
                setPendingTxHash(txHash);
                setPendingAction("approve");
            },
            onError: (error: Error) => {
                console.error("❌ Approve job error:", error);
                alert(`❌ Failed to approve job: ${error.message}`);
            },
        });
    };

    const handleRaiseDispute = async () => {
        if (!evidenceFile || !disputeReason || !job) return;

        try {
            // Upload evidence to IPFS
            const formData = new FormData();
            formData.append("file", evidenceFile);

            const response = await fetch("/api/ipfs/upload", {
                method: "POST",
                body: formData,
            });

            const { ipfsHash } = await response.json();

            // Raise dispute on contract
            writeContract({
                address: ESCROW_CONTRACT_ADDRESS,
                abi: ESCROW_ABI,
                functionName: "raiseDispute",
                args: [BigInt(job.contract_job_id), ipfsHash],
            }, {
                onSuccess: async (txHash) => {
                    console.log("✅ Dispute tx sent:", txHash);
                    // Save dispute to database (metadata is safe to save early)
                    await supabase.from("disputes").insert({
                        contract_dispute_id: 0,
                        job_id: job.id,
                        contract_job_id: job.contract_job_id,
                        raised_by: address,
                        reason: disputeReason,
                        status: "RAISED",
                    });
                    setPendingTxHash(txHash);
                    setPendingAction("dispute");
                },
                onError: (error: Error) => {
                    console.error("❌ Raise dispute error:", error);
                    alert(`❌ Failed to raise dispute: ${error.message}`);
                },
            });
        } catch (error) {
            console.error("Error raising dispute:", error);
            alert("Failed to raise dispute");
        }
    };

    const handleCancelJob = async () => {
        if (!job) return;

        // Verify user is the client
        if (address?.toLowerCase() !== job.client?.toLowerCase()) {
            alert("❌ Only the client who created this job can cancel it.\n\nYour wallet: " + address + "\nJob client: " + job.client);
            setShowCancelDialog(false);
            return;
        }

        setIsCancelling(true);

        try {
            console.log("🔄 Cancelling job...");
            console.log("Job ID:", job.contract_job_id);
            console.log("Your wallet:", address);
            console.log("Job client:", job.client);

            writeContract({
                address: ESCROW_CONTRACT_ADDRESS,
                abi: ESCROW_ABI,
                functionName: "cancelJob",
                args: [BigInt(job.contract_job_id)],
                gas: 500000n, // Explicitly set gas limit to avoid estimation issues
            }, {
                onSuccess: (txHash) => {
                    console.log("✅ Cancel tx sent:", txHash);
                    console.log("⏳ Waiting for confirmation...");
                    setPendingTxHash(txHash);
                    setPendingAction("cancel");
                },
                onError: (error: Error) => {
                    console.error("❌ Cancellation error:", error);

                    let errorMessage = error.message || "Unknown error";

                    // Better error messages
                    if (errorMessage.includes("Only client can cancel")) {
                        errorMessage = "Only the job client can cancel this job. Please connect with the wallet that created it.";
                    } else if (errorMessage.includes("Can only cancel open jobs")) {
                        errorMessage = "This job cannot be cancelled because it's no longer in OPEN status.";
                    } else if (errorMessage.includes("exceeds the configured cap")) {
                        errorMessage = "Gas fee limit exceeded. Please:\n1. Make sure you have enough testnet POL\n2. Try increasing the gas limit in MetaMask (Edit > Advanced > Max fee = 2)";
                    }

                    alert(`❌ Failed to cancel job:\n\n${errorMessage}`);
                    setIsCancelling(false);
                }
            });
        } catch (error) {
            console.error("Error cancelling job:", error);
            alert(`Failed to cancel job: ${error instanceof Error ? error.message : "Unknown error"}`);
            setIsCancelling(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050505]">
                <Navbar />
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-[#050505]">
                <Navbar />
                <div className="container mx-auto px-6 py-12 text-center">
                    <p className="text-[#8888a0]">Job not found</p>
                </div>
            </div>
        );
    }

    const isClient = address?.toLowerCase() === job.client.toLowerCase();
    const isFreelancer = address?.toLowerCase() === job.freelancer?.toLowerCase();
    const canAccept = job.status === "OPEN" && !isClient && isConnected;
    const canSubmit = job.status === "ACCEPTED" && isFreelancer;
    const canApprove = job.status === "SUBMITTED" && isClient;
    const canDispute = job.status === "SUBMITTED" && (isClient || isFreelancer);
    const canCancel = job.status === "OPEN" && isClient && isConnected;

    return (
        <div className="min-h-screen bg-[#050505]">
            <Navbar />

            <div className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Job Header */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                                    <div className="flex items-center gap-3 text-sm text-[#8888a0]">
                                        <span>Client: {formatAddress(job.client)}</span>
                                        {job.freelancer && (
                                            <span>• Freelancer: {formatAddress(job.freelancer)}</span>
                                        )}
                                    </div>
                                </div>
                                <Badge variant={
                                    job.status === "OPEN" ? "success" :
                                        job.status === "APPROVED" ? "success" :
                                            job.status === "DISPUTED" ? "danger" :
                                                "warning"
                                }>
                                    {job.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-[#f0f0f5] mb-2">Description</h3>
                                <p className="text-slate-700 dark:text-slate-300">{job.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1a1a24]">
                                <div>
                                    <div className="text-sm text-[#8888a0]">Amount</div>
                                    <div className="text-xl font-bold text-[#f0f0f5]">
                                        ${formatUSDC(BigInt(job.amount))} USDC
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-[#8888a0]">Deadline</div>
                                    <div className="text-lg font-semibold text-[#f0f0f5]">
                                        {new Date(job.deadline * 1000).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {job.description_ipfs && (
                                <a
                                    href={getIPFSUrl(job.description_ipfs)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    View on IPFS <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                        </CardContent>
                    </Card>

                    {/* Deliverable Section */}
                    {job.deliverable_ipfs && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Deliverable</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <a
                                    href={getIPFSUrl(job.deliverable_ipfs)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    View Deliverable on IPFS <ExternalLink className="w-4 h-4" />
                                </a>
                            </CardContent>
                        </Card>
                    )}

                    {/* Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Accept Job */}
                            {canAccept && (
                                <Button onClick={handleAcceptJob} disabled={isPending} className="w-full">
                                    {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Accept Job
                                </Button>
                            )}

                            {/* Submit Deliverable */}
                            {canSubmit && (
                                <div className="space-y-3">
                                    <Label>Upload Deliverable</Label>
                                    <Input
                                        type="file"
                                        onChange={(e) => setDeliverableFile(e.target.files?.[0] || null)}
                                    />
                                    <Button
                                        onClick={handleSubmitDeliverable}
                                        disabled={!deliverableFile || isPending}
                                        className="w-full gap-2"
                                    >
                                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                        Submit Deliverable
                                    </Button>
                                </div>
                            )}

                            {/* Approve or Dispute */}
                            {canApprove && (
                                <div className="space-y-3">
                                    <Button
                                        onClick={handleApproveJob}
                                        disabled={isPending}
                                        className="w-full gap-2"
                                        variant="default"
                                    >
                                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                        Approve & Release Funds
                                    </Button>

                                    <Button
                                        onClick={() => setShowDisputeForm(!showDisputeForm)}
                                        variant="destructive"
                                        className="w-full gap-2"
                                    >
                                        <AlertTriangle className="w-4 h-4" />
                                        Raise Dispute
                                    </Button>
                                </div>
                            )}

                            {/* Dispute Form */}
                            {showDisputeForm && canDispute && (
                                <div className="space-y-3 pt-4 border-t border-[#1a1a24]">
                                    <div>
                                        <Label>Dispute Reason</Label>
                                        <Textarea
                                            value={disputeReason}
                                            onChange={(e) => setDisputeReason(e.target.value)}
                                            placeholder="Explain why you're raising a dispute..."
                                            rows={4}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label>Evidence (PDF, images, etc.)</Label>
                                        <Input
                                            type="file"
                                            onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                                            className="mt-2"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleRaiseDispute}
                                        disabled={!disputeReason || !evidenceFile || isPending}
                                        variant="destructive"
                                        className="w-full"
                                    >
                                        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        Submit Dispute
                                    </Button>
                                </div>
                            )}

                            {/* Cancel Job */}
                            {canCancel && (
                                <div className="pt-4 border-t border-[#1a1a24]">
                                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-3">
                                        <p className="text-sm text-amber-900 dark:text-amber-100 font-medium mb-1">
                                            No one has accepted this job yet
                                        </p>
                                        <p className="text-xs text-amber-700 dark:text-amber-300">
                                            You can cancel and get a full refund of <strong>${formatUSDC(BigInt(job.amount))} USDC</strong>
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => setShowCancelDialog(true)}
                                        disabled={isCancelling || isPending}
                                        variant="outline"
                                        className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/10"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Cancel Job & Get Refund
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Cancel Job Confirmation Dialog */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Job & Get Refund?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3">
                            <p>
                                This will immediately cancel the job and refund{" "}
                                <strong className="text-[#f0f0f5]">
                                    ${formatUSDC(BigInt(job?.amount || 0))} USDC
                                </strong>{" "}
                                to your wallet.
                            </p>
                            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 text-left">
                                <p className="text-xs text-[#8888a0]">
                                    <strong>Job:</strong> {job?.title}
                                </p>
                            </div>
                            <p className="text-xs text-slate-500">
                                This action cannot be undone. The job will be permanently cancelled.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isCancelling}>
                            Keep Job Active
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelJob}
                            disabled={isCancelling}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {isCancelling ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing Refund...
                                </>
                            ) : (
                                "Yes, Cancel & Refund"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
