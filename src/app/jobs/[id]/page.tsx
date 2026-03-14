"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ESCROW_ABI } from "@/lib/contracts";
import { ESCROW_CONTRACT_ADDRESS } from "@/lib/wagmi";
import { supabase } from "@/lib/supabase";
import { formatUSDC, formatAddress, getIPFSUrl } from "@/lib/utils";
import { Loader2, ExternalLink, Upload, CheckCircle2, AlertTriangle, XCircle, MessageCircle, UserCheck } from "lucide-react";
import JobXmtpChat from "@/components/chat/JobXmtpChat";
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
    const [jobEventNotice, setJobEventNotice] = useState<string | null>(null);
    const chatSectionRef = useRef<HTMLDivElement | null>(null);

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

    const createNotification = async ({
        wallet,
        type,
        title,
        message,
        jobId,
    }: {
        wallet: string;
        type: string;
        title: string;
        message: string;
        jobId?: string;
    }) => {
        try {
            await supabase.from("notifications").insert({
                wallet: wallet.toLowerCase(),
                type,
                title,
                message,
                job_id: jobId,
            });
        } catch (error) {
            console.error("Failed to create notification:", error);
        }
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
                        {
                            const { error } = await supabase
                                .from("jobs")
                                .update({ freelancer: address, status: "WAITING_CLIENT_APPROVAL" })
                                .eq("id", job.id);

                            // Keep UI responsive even if Supabase sync is delayed/fails.
                            setJob((prev) =>
                                prev
                                    ? {
                                        ...prev,
                                        freelancer: address || prev.freelancer,
                                        status: "WAITING_CLIENT_APPROVAL",
                                    }
                                    : prev
                            );

                            if (error) {
                                console.error("Supabase update failed after accept:", error);
                                setJobEventNotice("Accepted on-chain. Waiting for client approval. Database sync is pending.");
                            } else {
                                setJobEventNotice("Accepted on-chain. Waiting for client approval before chat and work start.");
                                await createNotification({
                                    wallet: job.client,
                                    type: "job_acceptance_requested",
                                    title: "Freelancer requested approval",
                                    message: `${formatAddress(address || "")} accepted "${job.title}". Approve to enable chat and start work.`,
                                    jobId: job.id,
                                });
                                fetchJob();
                            }
                        }
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
                    setJobEventNotice("Acceptance transaction sent. Waiting for on-chain confirmation...");
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

    const handleApproveFreelancerAcceptance = async () => {
        if (!job || !job.freelancer || !isClient) return;

        const { error } = await supabase
            .from("jobs")
            .update({ status: "ACCEPTED" })
            .eq("id", job.id);

        if (error) {
            console.error("Failed to approve freelancer acceptance:", error);
            alert(`❌ Failed to approve freelancer: ${error.message}`);
            return;
        }

        setJob((prev) => (prev ? { ...prev, status: "ACCEPTED" } : prev));
        setJobEventNotice("Freelancer approved. Chat is now enabled.");

        await createNotification({
            wallet: job.freelancer,
            type: "job_accepted",
            title: "Your acceptance was approved",
            message: `Client approved your acceptance for "${job.title}". You can now chat and proceed with the job.`,
            jobId: job.id,
        });

        setTimeout(() => {
            chatSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
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
    const canApproveFreelancer = job.status === "WAITING_CLIENT_APPROVAL" && isClient;
    const isFreelancerWaitingApproval = job.status === "WAITING_CLIENT_APPROVAL" && isFreelancer;
    const canSubmit = job.status === "ACCEPTED" && isFreelancer;
    const canApprove = job.status === "SUBMITTED" && isClient;
    const canDispute = job.status === "SUBMITTED" && (isClient || isFreelancer);
    const canCancel = job.status === "OPEN" && isClient && isConnected;
    const canAccessChat =
        Boolean(job.freelancer) &&
        (isClient || isFreelancer) &&
        ["ACCEPTED", "SUBMITTED", "DISPUTED", "APPROVED", "RESOLVED"].includes(job.status);
    const isChatPhase = ["ACCEPTED", "SUBMITTED", "DISPUTED", "APPROVED", "RESOLVED"].includes(job.status);
    const isAwaitingAcceptConfirmation = pendingAction === "accept" && Boolean(pendingTxHash) && !txReceipt;
    const chatWithAddress = isClient ? job.freelancer : job.client;
    const statusLabel = job.status === "WAITING_CLIENT_APPROVAL"
        ? "PENDING CLIENT APPROVAL"
        : job.status;

    return (
        <div className="min-h-screen bg-[#050505]">
            <Navbar />

            <div className="w-full px-0 py-0">
                <div className="grid lg:grid-cols-[320px_1fr] gap-0 items-start">
                    <aside className="border-r border-[#1a1a24] bg-[#0d0d12] overflow-hidden lg:sticky lg:top-0 h-[calc(100vh-64px)]">
                        <div className="px-5 py-4 border-b border-[#1a1a24] bg-[#101119]">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[11px] uppercase tracking-widest text-[#82839a]">Job Workspace</p>
                                    <h1 className="text-xl font-semibold text-[#f0f0f5] mt-1 line-clamp-2">{job.title}</h1>
                                    <p className="text-xs text-[#8f90a6] mt-1">Contract #{job.contract_job_id}</p>
                                </div>
                                <Badge variant={
                                    job.status === "OPEN" ? "success" :
                                        job.status === "APPROVED" ? "success" :
                                            job.status === "DISPUTED" ? "danger" :
                                                "warning"
                                }>
                                    {statusLabel}
                                </Badge>
                            </div>
                        </div>

                        <div className="p-5 space-y-5">
                            <div className="rounded-xl border border-[#252635] bg-[#12131b] p-3">
                                <p className="text-xs text-[#8c8ea4] mb-2">Project Brief</p>
                                <p className="text-sm text-[#d5d7e4] leading-relaxed line-clamp-4">{job.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="rounded-lg border border-[#242535] bg-[#11121a] px-3 py-2">
                                    <p className="text-[11px] text-[#8b8ea1]">Amount</p>
                                    <p className="text-sm font-semibold text-[#f0f0f5]">${formatUSDC(BigInt(job.amount))} USDC</p>
                                </div>
                                <div className="rounded-lg border border-[#242535] bg-[#11121a] px-3 py-2">
                                    <p className="text-[11px] text-[#8b8ea1]">Deadline</p>
                                    <p className="text-sm font-semibold text-[#f0f0f5]">{new Date(job.deadline * 1000).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="rounded-lg border border-[#242535] bg-[#11121a] px-3 py-2 text-xs">
                                <p className="text-[#f0f0f5]">Client: <span className="text-[#8f90a6]">{formatAddress(job.client)}</span></p>
                                <p className="text-[#f0f0f5] mt-1">Freelancer: <span className="text-[#8f90a6]">{job.freelancer ? formatAddress(job.freelancer) : "Not assigned"}</span></p>
                            </div>

                            {job.description_ipfs && (
                                <a
                                    href={getIPFSUrl(job.description_ipfs)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-xs text-indigo-300 hover:text-indigo-200"
                                >
                                    View Description on IPFS <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            )}

                            {job.deliverable_ipfs && (
                                <a
                                    href={getIPFSUrl(job.deliverable_ipfs)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-xs text-emerald-300 hover:text-emerald-200"
                                >
                                    View Deliverable on IPFS <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            )}

                            <div className="pt-2 border-t border-[#1f202b] space-y-3">
                                {jobEventNotice && (
                                    <div className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                                        {jobEventNotice}
                                    </div>
                                )}

                                {isAwaitingAcceptConfirmation && (
                                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
                                        Acceptance is pending on-chain confirmation.
                                    </div>
                                )}

                                {canAccept && (
                                    <div className="space-y-2">
                                        <Button onClick={handleAcceptJob} disabled={isPending} className="w-full">
                                            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                            Accept Job
                                        </Button>
                                        <div className="w-full rounded-lg border border-[#1a1a24] bg-[#0b0b10] px-3 py-2 text-xs text-[#8888a0]">
                                            <span className="inline-flex items-center gap-1.5">
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                Chat unlocks after client approval.
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {canApproveFreelancer && (
                                    <div className="space-y-2">
                                        <div className="w-full rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs text-indigo-300">
                                            Freelancer accepted on-chain. Approve to enable chat.
                                        </div>
                                        <Button onClick={handleApproveFreelancerAcceptance} className="w-full gap-2">
                                            <UserCheck className="w-4 h-4" />
                                            Approve Freelancer
                                        </Button>
                                    </div>
                                )}

                                {isFreelancerWaitingApproval && (
                                    <div className="w-full rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                                        Waiting for client approval.
                                    </div>
                                )}

                                {canSubmit && (
                                    <div className="space-y-2">
                                        <Label>Upload Deliverable</Label>
                                        <Input type="file" onChange={(e) => setDeliverableFile(e.target.files?.[0] || null)} />
                                        <Button onClick={handleSubmitDeliverable} disabled={!deliverableFile || isPending} className="w-full gap-2">
                                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                            Submit Deliverable
                                        </Button>
                                    </div>
                                )}

                                {canApprove && (
                                    <div className="space-y-2">
                                        <Button onClick={handleApproveJob} disabled={isPending} className="w-full gap-2" variant="default">
                                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                            Approve & Release Funds
                                        </Button>
                                        <Button onClick={() => setShowDisputeForm(!showDisputeForm)} variant="destructive" className="w-full gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            Raise Dispute
                                        </Button>
                                    </div>
                                )}

                                {showDisputeForm && canDispute && (
                                    <div className="space-y-2 pt-2 border-t border-[#1a1a24]">
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
                                            <Label>Evidence</Label>
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

                                {canCancel && (
                                    <Button
                                        onClick={() => setShowCancelDialog(true)}
                                        disabled={isCancelling || isPending}
                                        variant="outline"
                                        className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/10"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Cancel Job & Get Refund
                                    </Button>
                                )}

                                {isChatPhase && (
                                    canAccessChat && chatWithAddress ? (
                                        <Button
                                            onClick={() => chatSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                                            variant="outline"
                                            className="w-full gap-2"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            Chat with {formatAddress(chatWithAddress)}
                                        </Button>
                                    ) : (
                                        <div className="w-full rounded-lg border border-[#1a1a24] bg-[#0b0b10] px-3 py-2 text-xs text-[#8888a0]">
                                            Chat is available only to the client and approved freelancer.
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </aside>

                    <section ref={chatSectionRef} className="border-l border-[#1a1a24] bg-[#0d0d12] overflow-hidden h-[calc(100vh-64px)]">
                        <div className="px-5 py-4 border-b border-[#1a1a24] bg-[#101119]">
                            <p className="text-[11px] uppercase tracking-widest text-[#82839a]">Collaboration</p>
                            <h2 className="text-lg font-semibold text-[#f0f0f5] mt-1">Client-Freelancer Chat Room</h2>
                            <p className="text-xs text-[#8f90a6] mt-1">
                                Chat and collaboration are enabled after client approval.
                            </p>
                        </div>

                        <div className="h-[calc(100%-80px)]">
                            {canAccessChat && job.freelancer ? (
                                <JobXmtpChat
                                    currentUserAddress={address}
                                    clientAddress={job.client}
                                    freelancerAddress={job.freelancer}
                                    jobStatus={job.status}
                                    jobTitle={job.title}
                                    jobAmount={formatUSDC(BigInt(job.amount))}
                                    jobId={job.id}
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center px-6 text-center">
                                    <div>
                                        <MessageCircle className="w-10 h-10 text-[#666a84] mx-auto mb-3" />
                                        <p className="text-[#f0f0f5] font-medium">Chat Not Available Yet</p>
                                        <p className="text-sm text-[#8f90a6] mt-2">
                                            Freelancer acceptance and client approval are required before this workspace becomes active.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
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
