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
import ProjectSubmissionForm from "@/components/jobs/ProjectSubmissionForm";
import { useGSAP } from "@/hooks/useGSAP";
import gsap from "gsap";
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
    const [disputeReason, setDisputeReason] = useState("");
    const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
    const [showDisputeForm, setShowDisputeForm] = useState(false);
    const [showSubmissionForm, setShowSubmissionForm] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);
    const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | undefined>();
    const [pendingAction, setPendingAction] = useState<string | null>(null);
    const [jobEventNotice, setJobEventNotice] = useState<string | null>(null);
    
    const sidebarRef = useRef<HTMLDivElement | null>(null);
    const chatSectionRef = useRef<HTMLElement | null>(null);

    const { data: txReceipt } = useWaitForTransactionReceipt({ hash: pendingTxHash });

    const fetchJob = async () => {
        if (!params.id) return;
        const jobId = Array.isArray(params.id) ? params.id[0] : params.id;
        const { data, error } = await supabase
            .from("jobs").select("*").eq("id", jobId).single();
        if (error) console.error("Error fetching job:", error);
        else setJob(data);
        setIsLoading(false);
    };

    const createNotification = async ({
        wallet, type, title, message, jobId,
    }: { wallet: string; type: string; title: string; message: string; jobId?: string }) => {
        try {
            await supabase.from("notifications").insert({
                wallet: wallet.toLowerCase(), type, title, message, job_id: jobId,
            });
        } catch (error) { console.error("Failed to create notification:", error); }
    };

    useEffect(() => {
        fetchJob();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    useGSAP(() => {
        if (isLoading) return;
        const tl = gsap.timeline();
        if (sidebarRef.current) {
            tl.from(sidebarRef.current, { x: -50, opacity: 0, duration: 0.8, ease: "power3.out" });
        }
        if (chatSectionRef.current) {
            tl.from(chatSectionRef.current, { x: 50, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6");
        }
    }, [isLoading]);

    useEffect(() => {
        const handleTxConfirmation = async () => {
            if (!txReceipt || !pendingAction || !job) return;
            if (txReceipt.status === "success") {
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
                                .from("jobs").update({ freelancer: address, status: "WAITING_CLIENT_APPROVAL" }).eq("id", job.id);
                            setJob((prev) => prev ? { ...prev, freelancer: address || prev.freelancer, status: "WAITING_CLIENT_APPROVAL" } : prev);
                            if (error) {
                                setJobEventNotice("Accepted on-chain. Waiting for client approval. Database sync is pending.");
                            } else {
                                setJobEventNotice("Accepted on-chain. Waiting for client approval before chat and work start.");
                                await createNotification({
                                    wallet: job.client, type: "job_acceptance_requested",
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
                alert(`❌ Transaction failed on-chain! The ${pendingAction} was NOT processed.`);
                setIsCancelling(false);
                setShowCancelDialog(false);
            }
            setPendingTxHash(undefined);
            setPendingAction(null);
        };
        handleTxConfirmation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [txReceipt]);

    const handleAcceptJob = () => {
        if (!job) return;
        writeContract({
            address: ESCROW_CONTRACT_ADDRESS, abi: ESCROW_ABI, functionName: "acceptJob",
            args: [BigInt(job.contract_job_id)],
        }, {
            onSuccess: (txHash) => {
                setJobEventNotice("Acceptance transaction sent. Waiting for on-chain confirmation...");
                setPendingTxHash(txHash); setPendingAction("accept");
            },
            onError: (error: Error) => alert(`❌ Failed to accept job: ${error.message}`),
        });
    };

    const handleSubmitDeliverable = async (ipfsHash: string) => {
        if (!ipfsHash || !job) return;
        try {
            writeContract({
                address: ESCROW_CONTRACT_ADDRESS, abi: ESCROW_ABI, functionName: "submitDeliverable",
                args: [BigInt(job.contract_job_id), ipfsHash],
            }, {
                onSuccess: async (txHash) => {
                    await supabase.from("jobs").update({ deliverable_ipfs: ipfsHash }).eq("id", job.id);
                    setPendingTxHash(txHash); setPendingAction("submit");
                },
                onError: (error: Error) => alert(`❌ Failed to submit deliverable: ${error.message}`),
            });
        } catch (error) { console.error("Error submitting deliverable:", error); alert("Failed to submit deliverable"); }
    };

    const handleApproveJob = () => {
        if (!job) return;
        writeContract({
            address: ESCROW_CONTRACT_ADDRESS, abi: ESCROW_ABI, functionName: "approveJob",
            args: [BigInt(job.contract_job_id)],
        }, {
            onSuccess: (txHash) => { setPendingTxHash(txHash); setPendingAction("approve"); },
            onError: (error: Error) => alert(`❌ Failed to approve job: ${error.message}`),
        });
    };

    const handleApproveFreelancerAcceptance = async () => {
        if (!job || !job.freelancer || !isClient) return;
        const { error } = await supabase.from("jobs").update({ status: "ACCEPTED" }).eq("id", job.id);
        if (error) { alert(`❌ Failed to approve freelancer: ${error.message}`); return; }
        setJob((prev) => (prev ? { ...prev, status: "ACCEPTED" } : prev));
        setJobEventNotice("Freelancer approved. Chat is now enabled.");
        await createNotification({
            wallet: job.freelancer, type: "job_accepted",
            title: "Your acceptance was approved",
            message: `Client approved your acceptance for "${job.title}". You can now chat and proceed with the job.`,
            jobId: job.id,
        });
        setTimeout(() => { chatSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 300);
    };

    const handleRaiseDispute = async () => {
        if (!disputeReason || !job) return;
        setIsSubmittingDispute(true);
        setPendingAction("dispute");

        try {
            let ipfsHash = "";
            if (evidenceFile) {
                const formData = new FormData();
                formData.append("file", evidenceFile);
                const response = await fetch("/api/ipfs/upload", { method: "POST", body: formData });
                if (response.ok) {
                    const data = await response.json();
                    ipfsHash = data.ipfsHash;
                }
            }

            // Directly insert into the database (bypassing the strict Smart Contract constraints)
            // Use a large negative unique value based on timestamp to avoid conflicts with real contract IDs
            const uniqueOffChainId = -(Date.now() % 2147483647);
            const { data: newDisputes, error: dbError } = await supabase.from("disputes").insert({
                contract_dispute_id: uniqueOffChainId,
                job_id: job.id,
                contract_job_id: job.contract_job_id,
                raised_by: address || "",
                reason: disputeReason,
                status: "DISPUTED", // Skip RAISED directly into DISPUTED state since no contract transaction is needed
                outcome: "PENDING",
                dispute_pdf_ipfs: ipfsHash,
            }).select();

            if (dbError) throw dbError;
            const createdDispute = newDisputes?.[0];

            if (createdDispute) {
                // Backgroundly trigger AI Dispute Arbitration
                fetch("/api/ai/analyze-dispute", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ disputeId: createdDispute.id })
                }).catch(console.error);

                alert("Dispute raised successfully! Our AI is reviewing the case now.");
                router.push(`/disputes/${createdDispute.id}`);
            }

        } catch (error) {
            console.error("Error raising dispute:", error);
            alert("Failed to raise dispute");
        } finally {
            setIsSubmittingDispute(false);
            setPendingAction(null);
            setShowDisputeForm(false);
        }
    };

    const handleCancelJob = async () => {
        if (!job) return;
        if (address?.toLowerCase() !== job.client?.toLowerCase()) {
            alert("❌ Only the client who created this job can cancel it.");
            setShowCancelDialog(false);
            return;
        }
        setIsCancelling(true);
        try {
            writeContract({
                address: ESCROW_CONTRACT_ADDRESS, abi: ESCROW_ABI, functionName: "cancelJob",
                args: [BigInt(job.contract_job_id)], gas: 500000n,
            }, {
                onSuccess: (txHash) => { setPendingTxHash(txHash); setPendingAction("cancel"); },
                onError: (error: Error) => {
                    let msg = error.message || "Unknown error";
                    if (msg.includes("Only client can cancel")) msg = "Only the job client can cancel this job.";
                    else if (msg.includes("Can only cancel open jobs")) msg = "This job cannot be cancelled because it's no longer in OPEN status.";
                    alert(`❌ Failed to cancel job:\n\n${msg}`);
                    setIsCancelling(false);
                },
            });
        } catch (error) {
            alert(`Failed to cancel job: ${error instanceof Error ? error.message : "Unknown error"}`);
            setIsCancelling(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black/90 text-white relative z-10 backdrop-blur-[2px]">
                <Navbar />
                <div className="flex items-center justify-center py-40">
                    <Loader2 className="w-12 h-12 animate-spin text-[#1DBF73]" />
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-black text-white relative z-10">
                <Navbar />
                <div className="container mx-auto px-6 py-32 text-center max-w-lg">
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                        <p className="text-white/60 text-lg">Job not found or access denied.</p>
                        <Button onClick={() => router.push("/jobs")} className="mt-6 bg-[#1DBF73] hover:bg-[#158a53] text-black font-bold">
                            Return to Jobs
                        </Button>
                    </div>
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
    const canDispute = ["ACCEPTED", "SUBMITTED"].includes(job.status) && (isClient || isFreelancer);
    const canCancel = job.status === "OPEN" && isClient && isConnected;
    const canAccessChat =
        Boolean(job.freelancer) && (isClient || isFreelancer) &&
        ["ACCEPTED", "SUBMITTED", "DISPUTED", "APPROVED", "RESOLVED"].includes(job.status);
    const isChatPhase = ["ACCEPTED", "SUBMITTED", "DISPUTED", "APPROVED", "RESOLVED"].includes(job.status);
    const isAwaitingAcceptConfirmation = pendingAction === "accept" && Boolean(pendingTxHash) && !txReceipt;
    const chatWithAddress = isClient ? job.freelancer : job.client;
    const statusLabel = job.status === "WAITING_CLIENT_APPROVAL" ? "PENDING APPROVAL" : job.status;

    return (
        <div className="min-h-screen bg-black text-white relative z-10">
            {/* Dark immersive background */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#020617] via-[#051014] to-[#01030a]" />
                <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] rounded-full bg-[#1DBF73]/5 blur-[120px]" />
                <div className="absolute bottom-0 left-[10%] w-[800px] h-[400px] rounded-full bg-blue-900/5 blur-[120px]" />
            </div>

            <Navbar />

            <div className="w-full">
                <div className="grid lg:grid-cols-[400px_1fr] h-[calc(100vh-64px)]">

                    {/* Sidebar Workspace */}
                    <aside ref={sidebarRef} className="border-r border-white/10 bg-black/40 backdrop-blur-3xl overflow-hidden overflow-y-auto">
                        <div className="px-8 py-8 border-b border-white/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                            <div className="flex items-start justify-between gap-4 relative">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#1DBF73]" /> Workspace
                                    </p>
                                    <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/70 leading-tight">{job.title}</h1>
                                    <p className="text-[13px] font-medium text-white/40 mt-3 font-mono bg-white/5 py-1 px-2 rounded inline-block border border-white/5">CT #{job.contract_job_id}</p>
                                </div>
                                <div className="shrink-0">
                                    <Badge variant="outline" className={`px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase border ${
                                        job.status === "OPEN" ? "bg-[#1DBF73]/10 text-[#1DBF73] border-[#1DBF73]/30" :
                                        job.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                                        job.status === "DISPUTED" ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                                    }`}>
                                        {statusLabel}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 mb-4">Project Brief</p>
                                <p className="text-[15px] font-light text-white/80 leading-[1.8] whitespace-pre-wrap">{job.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">Amount</p>
                                    <p className="text-2xl font-black text-[#1DBF73] drop-shadow-[0_0_12px_rgba(29,191,115,0.4)]">${formatUSDC(BigInt(job.amount))}</p>
                                </div>
                                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">Deadline</p>
                                    <p className="text-[17px] font-bold text-white mt-1">{new Date(job.deadline * 1000).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-4">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">Client</p>
                                    <a href={`https://polygonscan.com/address/${job.client}`} target="_blank" rel="noopener noreferrer" className="text-[14px] font-mono text-white/90 hover:text-[#1DBF73] transition-colors">{formatAddress(job.client)}</a>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">Freelancer</p>
                                    {job.freelancer ? (
                                        <a href={`https://polygonscan.com/address/${job.freelancer}`} target="_blank" rel="noopener noreferrer" className="text-[14px] font-mono text-[#818cf8] hover:text-indigo-400 transition-colors">{formatAddress(job.freelancer)}</a>
                                    ) : (
                                        <p className="text-[14px] font-bold text-white/30 italic">Not Assigned</p>
                                    )}
                                </div>
                            </div>

                            {(job.description_ipfs || job.deliverable_ipfs) && (
                                <div className="space-y-3">
                                    {job.description_ipfs && (
                                        <a href={getIPFSUrl(job.description_ipfs)} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group">
                                            <span className="text-[13px] font-bold w-full">Brief Documents</span>
                                            <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white" />
                                        </a>
                                    )}
                                    {job.deliverable_ipfs && (
                                        <a href={getIPFSUrl(job.deliverable_ipfs)} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center justify-between p-4 rounded-xl border border-[#1DBF73]/30 bg-[#1DBF73]/10 hover:bg-[#1DBF73]/20 transition-colors group">
                                            <span className="text-[13px] font-bold text-[#1DBF73]">Final Deliverables</span>
                                            <ExternalLink className="w-4 h-4 text-[#1DBF73]/60 group-hover:text-[#1DBF73]" />
                                        </a>
                                    )}
                                </div>
                            )}

                            <div className="pt-6 border-t border-white/10 space-y-4">
                                {jobEventNotice && (
                                    <div className="rounded-xl border border-[#1DBF73]/30 bg-[#1DBF73]/10 p-4 text-[13px] font-bold text-[#1DBF73]">
                                        {jobEventNotice}
                                    </div>
                                )}
                                {isAwaitingAcceptConfirmation && (
                                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-[13px] font-bold text-amber-500">
                                        Acceptance is pending on-chain confirmation...
                                    </div>
                                )}

                                {canAccept && (
                                    <div className="space-y-3">
                                        <Button onClick={handleAcceptJob} disabled={isPending} className="w-full h-14 rounded-xl font-black uppercase tracking-wider bg-[#1DBF73] hover:bg-[#158a53] text-black shadow-[0_0_20px_rgba(29,191,115,0.4)]">
                                            {isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                                            Accept Job
                                        </Button>
                                        <div className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-[12px] font-medium text-white/50 text-center flex items-center justify-center gap-2">
                                            <MessageCircle className="w-4 h-4" /> Chat unlocks upon client approval
                                        </div>
                                    </div>
                                )}

                                {canApproveFreelancer && (
                                    <div className="space-y-3">
                                        <div className="w-full rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-[13px] font-bold text-indigo-400 text-center">
                                            Freelancer accepted. Approve to start.
                                        </div>
                                        <Button onClick={handleApproveFreelancerAcceptance} className="w-full h-14 rounded-xl font-black uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                                            <UserCheck className="w-5 h-5 mr-2" /> Approve Freelancer
                                        </Button>
                                    </div>
                                )}

                                {isFreelancerWaitingApproval && (
                                    <div className="w-full rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-[13px] font-bold text-indigo-400 text-center">
                                        Waiting for client approval...
                                    </div>
                                )}

                                {canSubmit && job && address && (
                                    <div className="space-y-3">
                                        {!showSubmissionForm ? (
                                            <Button
                                                onClick={() => setShowSubmissionForm(true)}
                                                className="w-full h-14 rounded-xl font-black uppercase tracking-wider bg-[#1DBF73] hover:bg-[#158a53] text-black shadow-[0_0_20px_rgba(29,191,115,0.4)] hover:shadow-[0_0_30px_rgba(29,191,115,0.6)] transition-all"
                                            >
                                                <Upload className="w-5 h-5 mr-2" />
                                                Create Submission
                                            </Button>
                                        ) : (
                                            <ProjectSubmissionForm
                                                jobId={job.id}
                                                jobTitle={job.title}
                                                freelancerAddress={address}
                                                onSubmitSuccess={handleSubmitDeliverable}
                                                isPending={isPending}
                                            />
                                        )}
                                    </div>
                                )}

                                {canApprove && (
                                    <div className="space-y-3">
                                        <Button onClick={handleApproveJob} disabled={isPending} className="w-full h-14 rounded-xl font-black uppercase tracking-wider bg-[#1DBF73] hover:bg-[#158a53] text-black shadow-[0_0_20px_rgba(29,191,115,0.4)]">
                                            {isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                                            Approve Delivery & Release Funds
                                        </Button>
                                    </div>
                                )}

                                {canDispute && !showDisputeForm && (
                                    <div className="mt-4">
                                        <Button onClick={() => setShowDisputeForm(true)} variant="outline" className="w-full h-12 rounded-xl font-bold uppercase tracking-wider text-red-400 border-red-500/30 hover:bg-red-500/10">
                                            <AlertTriangle className="w-4 h-4 mr-2" /> Raise Dispute
                                        </Button>
                                    </div>
                                )}

                                {showDisputeForm && canDispute && (
                                    <div className="space-y-4 p-6 rounded-2xl border border-red-500/30 bg-red-500/5 mt-4">
                                        <div>
                                            <Label className="text-[12px] font-bold uppercase tracking-widest text-red-400">Dispute Reason</Label>
                                            <Textarea
                                                value={disputeReason}
                                                onChange={(e) => setDisputeReason(e.target.value)}
                                                placeholder="Explain the issue clearly..."
                                                rows={4} className="mt-2 bg-black/40 border-red-500/20 text-white focus-visible:ring-red-500/50"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-[12px] font-bold uppercase tracking-widest text-red-400">Evidence Document <span className="font-normal normal-case text-red-400/60">(optional)</span></Label>
                                            <Input type="file" onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)} className="mt-2 bg-black/40 border-red-500/20 text-white" />
                                        </div>
                                        <Button onClick={handleRaiseDispute} disabled={!disputeReason || isSubmittingDispute} className="w-full h-12 mt-2 bg-red-500 hover:bg-red-600 text-white font-bold tracking-wider">
                                            {isSubmittingDispute ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                                            Submit Dispute
                                        </Button>
                                    </div>
                                )}

                                {canCancel && (
                                    <Button onClick={() => setShowCancelDialog(true)} disabled={isCancelling || isPending}
                                        variant="outline" className="w-full h-12 rounded-xl font-bold uppercase tracking-wider text-red-400 border-red-500/30 hover:bg-red-500/10 mt-6">
                                        <XCircle className="w-4 h-4 mr-2" /> Cancel & Refund
                                    </Button>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Chat Area */}
                    <section ref={chatSectionRef} className="h-full bg-[#0a0f1e]/80 backdrop-blur-xl relative overflow-hidden flex flex-col border-l border-white/5">
                        <div className="px-8 py-6 border-b border-white/10 bg-black/20 shrink-0 relative z-10">
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Collaboration
                            </p>
                            <h2 className="text-xl font-extrabold text-white">Client-Freelancer Secure Chat</h2>
                            <p className="text-[13px] font-medium text-white/40 mt-1">End-to-End Encrypted via XMTP</p>
                        </div>

                        <div className="flex-1 overflow-hidden relative z-10 p-0 m-0 [&>div]:h-full [&>div]:bg-transparent">
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
                                <div className="h-full flex items-center justify-center p-8 text-center bg-[url('/bg-pattern.svg')] bg-[size:40px_40px]">
                                    <div className="w-full max-w-sm p-10 rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-2xl">
                                        <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mx-auto mb-6 bg-white/5">
                                            <MessageCircle className="w-8 h-8 text-white/40" />
                                        </div>
                                        <p className="text-xl font-bold text-white mb-2">Workspace Locked</p>
                                        <p className="text-[14px] leading-[1.8] text-white/40">
                                            Chat activates automatically once the freelancer accepts and the client approves.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {/* Cancel Dialog */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent className="bg-[#0f172a] border-white/10 text-white sm:rounded-[2rem]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold">Cancel Job?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-4 text-white/60">
                            <p className="text-[15px] leading-relaxed">
                                This will immediately cancel the job and refund the escrow.
                            </p>
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-left">
                                <p className="text-2xl font-black text-red-400">${formatUSDC(BigInt(job?.amount || 0))} USDC</p>
                                <p className="text-sm font-medium text-red-400/60 mt-1">Refund to your wallet</p>
                            </div>
                            <p className="text-sm bg-white/5 p-3 rounded-xl border border-white/5">
                                <strong>Job:</strong> {job?.title}
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 border-t border-white/5 pt-6">
                        <AlertDialogCancel disabled={isCancelling} className="border-0 bg-white/10 text-white hover:bg-white/20 h-11 rounded-xl font-bold">Nevermind</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelJob} disabled={isCancelling}
                            className="bg-red-500 hover:bg-red-600 focus:ring-red-600 text-white h-11 rounded-xl font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                            {isCancelling ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                            ) : "Confirm & Refund"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
