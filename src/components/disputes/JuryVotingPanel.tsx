"use client";


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAccount, useWriteContract } from "wagmi";
import { ESCROW_ABI } from "@/lib/contracts";
import { ESCROW_CONTRACT_ADDRESS } from "@/lib/wagmi";
import { formatAddress } from "@/lib/utils";
import { CheckCircle2, Loader2 } from "lucide-react";

interface JuryVotingPanelProps {
    disputeId: bigint;
    jurors: string[];
    votes: {
        juror: string;
        decision: "CLIENT" | "FREELANCER";
        votedAt: number;
    }[];
    clientAddress: string;
    freelancerAddress: string;
}

export default function JuryVotingPanel({
    disputeId,
    jurors,
    votes,
    clientAddress,
    freelancerAddress,
}: JuryVotingPanelProps) {
    const { address } = useAccount();
    const { writeContract, isPending } = useWriteContract();

    const isJuror = address && jurors.includes(address);
    const hasVoted = votes.some(v => v.juror.toLowerCase() === address?.toLowerCase());

    const clientVotes = votes.filter(v => v.decision === "CLIENT").length;
    const freelancerVotes = votes.filter(v => v.decision === "FREELANCER").length;

    const handleVote = (voteForClient: boolean) => {
        if (!isJuror || hasVoted) return;

        writeContract({
            address: ESCROW_CONTRACT_ADDRESS,
            abi: ESCROW_ABI,
            functionName: "castVote",
            args: [disputeId, voteForClient],
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Jury Voting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Vote Tally */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="text-sm text-blue-700 dark:text-blue-400 mb-1">
                            Client
                        </div>
                        <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                            {clientVotes} / 3
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            {formatAddress(clientAddress)}
                        </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                        <div className="text-sm text-purple-700 dark:text-purple-400 mb-1">
                            Freelancer
                        </div>
                        <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                            {freelancerVotes} / 3
                        </div>
                        <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                            {formatAddress(freelancerAddress)}
                        </div>
                    </div>
                </div>

                {/* Juror List */}
                <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                        Selected Jurors
                    </h4>
                    <div className="space-y-2">
                        {jurors.map((juror, index) => {
                            const vote = votes.find(v => v.juror.toLowerCase() === juror.toLowerCase());
                            const isCurrentUser = juror.toLowerCase() === address?.toLowerCase();

                            return (
                                <div
                                    key={index}
                                    className={`flex items-center justify-between p-3 rounded-lg border ${isCurrentUser
                                        ? "border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20"
                                        : "border-slate-200 dark:border-slate-700"
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-mono text-slate-700 dark:text-slate-300">
                                            {formatAddress(juror)}
                                        </span>
                                        {isCurrentUser && (
                                            <Badge variant="info" className="text-xs">You</Badge>
                                        )}
                                    </div>

                                    {vote ? (
                                        <Badge variant={vote.decision === "CLIENT" ? "info" : "default"}>
                                            Voted: {vote.decision}
                                        </Badge>
                                    ) : (
                                        <Badge variant="warning">Pending</Badge>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Voting Interface */}
                {isJuror && !hasVoted && (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                            Cast Your Vote
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => handleVote(true)}
                                disabled={isPending}
                                className="h-auto py-4 flex-col gap-2 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                                {isPending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-6 h-6 text-blue-600" />
                                        <span className="font-semibold">Vote for Client</span>
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => handleVote(false)}
                                disabled={isPending}
                                className="h-auto py-4 flex-col gap-2 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            >
                                {isPending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-6 h-6 text-purple-600" />
                                        <span className="font-semibold">Vote for Freelancer</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {isJuror && hasVoted && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                        <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                            You have cast your vote
                        </p>
                    </div>
                )}

                {!isJuror && (
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            You are not a juror for this dispute
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
