"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Client, type DecodedMessage, type Dm, type Identifier, type Signer, type XmtpEnv } from "@xmtp/browser-sdk";
import { hexToBytes } from "viem";
import { useWalletClient } from "wagmi";
import { Loader2, Send, MessageSquare, Users, Search, Paperclip, Smile, ShieldCheck } from "lucide-react";

type ChatMessage = {
    id: string;
    text: string;
    sentAt: number;
    isMine: boolean;
};

type JobXmtpChatProps = {
    currentUserAddress?: string;
    clientAddress: string;
    freelancerAddress: string;
    jobStatus: string;
    jobTitle?: string;
    jobAmount?: string;
};

const CHAT_ENABLED_STATUSES = new Set([
    "ACCEPTED",
    "SUBMITTED",
    "DISPUTED",
    "APPROVED",
    "RESOLVED",
]);

const XMTP_ENV = (process.env.NEXT_PUBLIC_XMTP_ENV || "dev") as XmtpEnv;

function normalizeAddress(address: string): string {
    return address.toLowerCase();
}

function extractMessageText(message: any): string {
    if (typeof message?.content === "string") return message.content;
    if (message?.content && typeof message?.content?.text === "string") return message.content.text;
    return "[Unsupported message type]";
}

function toMillis(sentAtNs: bigint | number | undefined): number {
    if (typeof sentAtNs === "bigint") return Number(sentAtNs / 1_000_000n);
    if (typeof sentAtNs === "number") return sentAtNs;
    return Date.now();
}

export default function JobXmtpChat({
    currentUserAddress,
    clientAddress,
    freelancerAddress,
    jobStatus,
    jobTitle,
    jobAmount,
}: JobXmtpChatProps) {
    const { data: walletClient } = useWalletClient();
    const xmtpClientRef = useRef<Client | null>(null);

    const [xmtpClient, setXmtpClient] = useState<Client | null>(null);
    const [dm, setDm] = useState<Dm | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [draft, setDraft] = useState("");
    const [isInitializing, setIsInitializing] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusHint, setStatusHint] = useState<string | null>(null);

    const normalizedCurrent = currentUserAddress ? normalizeAddress(currentUserAddress) : "";
    const normalizedClient = normalizeAddress(clientAddress);
    const normalizedFreelancer = normalizeAddress(freelancerAddress);

    const isParticipant =
        normalizedCurrent === normalizedClient || normalizedCurrent === normalizedFreelancer;

    const peerAddress = useMemo(() => {
        if (!normalizedCurrent) return "";
        if (normalizedCurrent === normalizedClient) return normalizedFreelancer;
        if (normalizedCurrent === normalizedFreelancer) return normalizedClient;
        return "";
    }, [normalizedClient, normalizedCurrent, normalizedFreelancer]);

    const canChatByStatus = CHAT_ENABLED_STATUSES.has(jobStatus);
    const counterPartyAddress = normalizedCurrent === normalizedClient ? freelancerAddress : clientAddress;

    const refreshMessages = useCallback(async (activeDm: Dm, activeClient: Client) => {
        await activeClient.conversations.sync();
        await activeDm.sync();
        const history = await activeDm.messages({ limit: 50n });

        const parsed = (history as DecodedMessage[])
            .map((message) => ({
                id: String(message?.id || `${message?.sentAtNs || Date.now()}`),
                text: extractMessageText(message),
                sentAt: toMillis(message?.sentAtNs),
                isMine: message?.senderInboxId === activeClient.inboxId,
            }))
            .sort((a: ChatMessage, b: ChatMessage) => a.sentAt - b.sentAt);

        setMessages(parsed);
    }, []);

    const initializeChat = useCallback(async () => {
        setIsInitializing(true);
        setError(null);
        setStatusHint(null);

        if (!canChatByStatus) {
            setIsInitializing(false);
            return;
        }

        if (!currentUserAddress || !isParticipant) {
            setIsInitializing(false);
            return;
        }

        if (!walletClient || !walletClient.account) {
            setIsInitializing(false);
            setError("Connect your wallet to start XMTP chat.");
            return;
        }

        if (!peerAddress) {
            setIsInitializing(false);
            setError("Unable to resolve the counterparty for this job.");
            return;
        }

        const signer: Signer = {
            type: "EOA",
            getIdentifier: () => ({
                identifier: walletClient.account!.address,
                identifierKind: "Ethereum",
            }),
            signMessage: async (message: string) => {
                const signatureHex = await walletClient.signMessage({
                    account: walletClient.account!,
                    message,
                });
                return hexToBytes(signatureHex);
            },
        };

        if (xmtpClientRef.current) {
            xmtpClientRef.current.close();
            xmtpClientRef.current = null;
        }

        const createdClient = await Client.create(signer, {
            env: XMTP_ENV,
            appVersion: "fairwork-chat/1.0.0",
        });
        xmtpClientRef.current = createdClient;

        await createdClient.conversations.syncAll();

        const identifier: Identifier = {
            identifier: peerAddress,
            identifierKind: "Ethereum",
        };

        const peerInboxId = await createdClient.findInboxIdByIdentifier(identifier);
        if (!peerInboxId) {
            setStatusHint("Counterparty XMTP inbox not found yet. They must open chat once; you can still try sending.");
        }

        const conversation = peerInboxId
            ? await createdClient.conversations.newDm(peerInboxId)
            : await createdClient.conversations.newDmWithIdentifier(identifier);

        setXmtpClient(createdClient);
        setDm(conversation);
        await refreshMessages(conversation, createdClient);
        setIsInitializing(false);
    }, [canChatByStatus, currentUserAddress, isParticipant, peerAddress, refreshMessages, walletClient]);

    useEffect(() => {
        let isCancelled = false;

        const init = async () => {
            try {
                await initializeChat();
                if (isCancelled) return;
            } catch (initError) {
                if (!isCancelled) {
                    setError(initError instanceof Error ? initError.message : "Failed to initialize XMTP chat.");
                    setIsInitializing(false);
                }
            }
        };

        init();

        return () => {
            isCancelled = true;
            if (xmtpClientRef.current) {
                xmtpClientRef.current.close();
                xmtpClientRef.current = null;
            }
        };
    }, [initializeChat]);

    useEffect(() => {
        if (!dm || !xmtpClient) return;

        let isCancelled = false;
        const intervalId = setInterval(async () => {
            if (isCancelled) return;
            try {
                setIsRefreshing(true);
                setError(null);
                await refreshMessages(dm, xmtpClient);
            } catch {
                // Ignore background poll errors to avoid noisy UI.
            } finally {
                if (!isCancelled) setIsRefreshing(false);
            }
        }, 5000);

        return () => {
            isCancelled = true;
            clearInterval(intervalId);
        };
    }, [dm, refreshMessages, xmtpClient]);

    const handleSend = async () => {
        if (!draft.trim() || !dm || !xmtpClient) return;

        try {
            setIsSending(true);
            setError(null);
            await dm.send(draft.trim());
            setDraft("");
            await refreshMessages(dm, xmtpClient);
        } catch (sendError) {
            setError(sendError instanceof Error ? sendError.message : "Failed to send message.");
        } finally {
            setIsSending(false);
        }
    };

    const formatTime = (value: number) =>
        new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const shortAddress = (value: string) => `${value.slice(0, 6)}...${value.slice(-4)}`;

    if (!canChatByStatus) {
        return (
            <p className="text-sm text-[#8888a0]">
                Chat becomes available after a freelancer accepts this job.
            </p>
        );
    }

    if (!currentUserAddress) {
        return <p className="text-sm text-[#8888a0]">Connect your wallet to access chat.</p>;
    }

    if (!isParticipant) {
        return (
            <p className="text-sm text-[#8888a0]">
                Only the job client and accepted freelancer can access this chat.
            </p>
        );
    }

    return (
        <div className="rounded-2xl border border-[#1a1a24] overflow-hidden bg-[#0b0b10]">
            <div className="grid md:grid-cols-[270px_1fr] min-h-[520px]">
                <aside className="border-r border-[#1a1a24] bg-[#09090d]">
                    <div className="p-4 border-b border-[#1a1a24]">
                        <h3 className="text-sm font-semibold text-[#f0f0f5] tracking-wide">FairWork Chat</h3>
                        <p className="text-xs text-[#86869a] mt-1">Slack-style workspace</p>
                    </div>

                    <div className="p-3">
                        <div className="rounded-xl border border-[#2c2c38] bg-[#12121a] px-3 py-2 mb-3">
                            <div className="text-[11px] uppercase tracking-wide text-[#8888a0]">Job</div>
                            <p className="text-sm text-[#f0f0f5] mt-1 line-clamp-2">{jobTitle || "Untitled Job"}</p>
                            {jobAmount && <p className="text-xs text-[#a4f3c2] mt-1">{jobAmount} USDC</p>}
                        </div>

                        <div className="rounded-xl border border-[#313145] bg-[#1a1a28] px-3 py-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-[#d5d5e3]">
                                    <MessageSquare className="w-4 h-4 text-indigo-300" />
                                    <span className="font-medium"># {jobTitle ? "job-room" : "chat-room"}</span>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">LIVE</span>
                            </div>
                            <p className="text-xs text-[#9b9bb3] mt-2">Direct collaboration channel</p>
                        </div>

                        <div className="mt-4 rounded-xl border border-[#2c2c38] bg-[#111118] p-3">
                            <div className="flex items-center gap-2 text-xs text-[#8e8ea5] mb-2">
                                <Users className="w-3.5 h-3.5" />
                                Participants
                            </div>
                            <div className="space-y-2 text-xs">
                                <p className="text-[#f0f0f5]">Client: <span className="text-[#9d9db3]">{shortAddress(clientAddress)}</span></p>
                                <p className="text-[#f0f0f5]">Freelancer: <span className="text-[#9d9db3]">{shortAddress(freelancerAddress)}</span></p>
                            </div>
                        </div>
                    </div>
                </aside>

                <section className="flex flex-col bg-[#0e0f13]">
                    <div className="px-4 py-3 border-b border-[#1a1a24] bg-[#11131a] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-semibold">
                                {counterPartyAddress.slice(2, 4).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[#f0f0f5]">{shortAddress(counterPartyAddress)}</p>
                                <p className="text-xs text-[#8f90a6]">online on XMTP ({XMTP_ENV})</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[#8f90a6]">
                            <button className="p-2 rounded-lg hover:bg-[#1b1d26]"><Search className="w-4 h-4" /></button>
                            <div className="px-2.5 py-1 rounded-full border border-[#2f3240] text-[11px]">
                                {isRefreshing ? "Syncing..." : "Synced"}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.04)_0,transparent_38%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.12)_0,transparent_42%),#0e0f13]">
                        {isInitializing ? (
                            <div className="h-full flex items-center justify-center text-sm text-[#8888a0] gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Initializing XMTP chat...
                            </div>
                        ) : error ? (
                            <div className="space-y-3">
                                <div className="text-sm text-red-400">{error}</div>
                                <button
                                    onClick={() => void initializeChat()}
                                    className="px-3 py-2 rounded-lg border border-[#2a2a35] text-xs text-[#cfcfe0] hover:bg-[#151520]"
                                >
                                    Retry XMTP Connection
                                </button>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-sm text-[#8888a0]">
                                No messages yet. Start the conversation.
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {messages.map((message) => (
                                    <div key={message.id} className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}>
                                        <div
                                            className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                                                message.isMine
                                                    ? "bg-[#3a5f52] text-[#e8fff3] rounded-br-md"
                                                    : "bg-[#1a1f2b] text-[#eef1ff] rounded-bl-md"
                                            }`}
                                        >
                                            <p className="leading-relaxed break-words">{message.text}</p>
                                            <p className={`mt-1 text-[11px] text-right ${message.isMine ? "text-[#c7f3de]" : "text-[#9ea6c7]"}`}>
                                                {formatTime(message.sentAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-t border-[#1a1a24] bg-[#11131a] px-3 py-3">
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg text-[#9093a8] hover:bg-[#1b1d26]">
                                <Smile className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg text-[#9093a8] hover:bg-[#1b1d26]">
                                <Paperclip className="w-4 h-4" />
                            </button>
                            <input
                                type="text"
                                value={draft}
                                onChange={(event) => setDraft(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Type a message"
                                className="flex-1 bg-[#171a24] border border-[#2a2f3d] rounded-full px-4 py-2.5 text-sm text-[#f0f0f5] placeholder:text-[#8888a0] focus:outline-none focus:border-[#6f86ff]"
                                disabled={isInitializing || !!error || isSending}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!draft.trim() || isInitializing || !!error || isSending}
                                className="w-10 h-10 rounded-full bg-[#25d366] text-[#0a2415] flex items-center justify-center hover:bg-[#2de06f] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                            <p className="text-[11px] text-[#777790]">
                                Messages are end-to-end encrypted over XMTP.
                            </p>
                            <div className="inline-flex items-center gap-1 text-[11px] text-[#85d7ac]">
                                <ShieldCheck className="w-3 h-3" />
                                Secure
                            </div>
                        </div>
                        {statusHint && <p className="text-xs text-amber-400 mt-2">{statusHint}</p>}
                    </div>
                </section>
            </div>
        </div>
    );
}
