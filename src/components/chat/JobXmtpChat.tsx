"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Client, type DecodedMessage, type Dm, type Identifier, type Signer, type XmtpEnv } from "@xmtp/browser-sdk";
import { hexToBytes } from "viem";
import { useWalletClient } from "wagmi";
import { Loader2, Send, Search, Paperclip, Smile, ShieldCheck, Mic, Trash2, Bold, Italic, Strikethrough, Link, List, ListOrdered, Code, Type, AtSign, Plus, LayoutList, ChevronDown, Hash, Video } from "lucide-react";
import JitsiMeetModal from "@/components/meet/JitsiMeetModal";

type ChatMessage = {
    id: string;
    text: string;
    sentAt: number;
    isMine: boolean;
    isAudio?: boolean;
    audioUrl?: string;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractMessageText(message: any): string {
    const content = message?.content;
    // Plain string (most common)
    if (typeof content === "string") return content;
    // Object with .text field
    if (content && typeof content?.text === "string") return content.text;
    // Raw bytes — XMTP v4 sometimes returns Uint8Array when codec isn't registered
    if (content instanceof Uint8Array || content instanceof ArrayBuffer) {
        try {
            const bytes = content instanceof Uint8Array ? content : new Uint8Array(content);
            return new TextDecoder().decode(bytes);
        } catch {
            return "[Binary message]";
        }
    }
    // contentBytes fallback (older SDK versions)
    if (message?.contentBytes instanceof Uint8Array) {
        try {
            return new TextDecoder().decode(message.contentBytes);
        } catch {
            return "[Binary message]";
        }
    }
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

    const [meetOpen, setMeetOpen] = useState(false);
    const meetRoomName = `fairwork-${normalizeAddress(clientAddress).slice(2, 8)}-${normalizeAddress(freelancerAddress).slice(2, 8)}`;

    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
            .map((message) => {
                const text = extractMessageText(message);
                let isAudio = false;
                let audioUrl = undefined;

                if (text.startsWith("[VOICE]:")) {
                    isAudio = true;
                    audioUrl = text.substring(8);
                }

                return {
                    id: String(message?.id || `${message?.sentAtNs || Date.now()}`),
                    text: isAudio ? "Voice message" : text,
                    sentAt: toMillis(message?.sentAtNs),
                    isMine: message?.senderInboxId === activeClient.inboxId,
                    isAudio,
                    audioUrl
                };
            })
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

        // Use a stable encryption key derived from the wallet address so the
        // local XMTP database persists across hot-reloads and re-mounts.
        const dbKey = new Uint8Array(32);
        const addrBytes = new TextEncoder().encode(walletClient.account!.address.toLowerCase());
        dbKey.set(addrBytes.slice(0, 32));

        const createdClient = await Client.create(signer, {
            env: XMTP_ENV,
            appVersion: "fairwork-chat/1.0.0",
            dbEncryptionKey: dbKey,
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
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
            if (mediaRecorderRef.current?.stream) {
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
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

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64AudioMessage = `[VOICE]:${reader.result}`;

                    if (base64AudioMessage.length > 1000000) {
                        setError("Voice message too large (limit ~1MB). Please record a shorter message.");
                        return;
                    }

                    if (dm && xmtpClient) {
                        try {
                            setIsSending(true);
                            await dm.send(base64AudioMessage);
                            await refreshMessages(dm, xmtpClient);
                        } catch (sendError) {
                            setError(sendError instanceof Error ? sendError.message : "Failed to send voice message.");
                        } finally {
                            setIsSending(false);
                        }
                    }
                };

                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingDuration(0);

            recordingIntervalRef.current = setInterval(() => {
                setRecordingDuration((prev) => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Microphone access denied or unavailable.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.onstop = () => {
                if (mediaRecorderRef.current?.stream) {
                    mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
                }
            };
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
            setRecordingDuration(0);
        }
    };

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
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
        <div className="h-[80vh] min-h-[600px] flex border border-[#2a2f3d] rounded-xl overflow-hidden shadow-xl font-sans">
            <aside className="border-r border-[#2a2f3d] bg-[#1a1d21] flex flex-col h-full text-[#b5bac1] w-[260px] shrink-0">
                {/* Header */}
                <div className="px-4 py-3.5 border-b border-[#2a2f3d] flex items-center justify-between hover:bg-[#202428] cursor-pointer transition-colors shadow-sm shrink-0">
                    <h3 className="font-bold text-[#f2f3f5] truncate">FairWork Workspace</h3>
                    <ChevronDown className="w-4 h-4 text-[#8a8e94]" />
                </div>

                {/* Channels & DMs */}
                <div className="flex-1 overflow-y-auto py-3 space-y-6 scroller-hidden">
                    {/* Job Info */}
                    <div className="px-3">
                        <h4 className="px-1 text-[11px] font-semibold text-[#8a8e94] uppercase tracking-wider mb-1">Job Details</h4>
                        <div className="px-2 py-1.5 rounded-md bg-[#202428] text-[#f2f3f5] border border-[#2a2f3d]">
                            <p className="text-[13px] font-medium truncate">{jobTitle || "Untitled Job"}</p>
                            {jobAmount && <p className="text-[11px] text-[#23a559] mt-0.5">{jobAmount} USDC</p>}
                        </div>
                    </div>

                    {/* Channels */}
                    <div className="px-3">
                        <div className="flex items-center justify-between px-1 mb-1 group cursor-pointer">
                            <h4 className="text-[11px] font-semibold text-[#8a8e94] group-hover:text-[#f2f3f5] uppercase tracking-wider transition-colors">Channels</h4>
                            <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-[#353740] text-[#f2f3f5] cursor-pointer">
                                <Hash className="w-4 h-4 opacity-70" />
                                <span className="text-[14px] font-medium truncate">general</span>
                            </div>
                            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#202428] cursor-pointer transition-colors">
                                <Hash className="w-4 h-4 opacity-70" />
                                <span className="text-[14px] font-medium truncate">job-discussion</span>
                            </div>
                        </div>
                    </div>

                    {/* Direct Messages */}
                    <div className="px-3">
                        <div className="flex items-center justify-between px-1 mb-1 group cursor-pointer">
                            <h4 className="text-[11px] font-semibold text-[#8a8e94] group-hover:text-[#f2f3f5] uppercase tracking-wider transition-colors">Direct messages</h4>
                            <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#202428] cursor-pointer transition-colors text-[#f2f3f5]">
                                <div className="relative flex items-center justify-center w-5 h-5 rounded bg-[#3a5f52] text-[10px] font-bold text-white overflow-hidden shrink-0">
                                    {clientAddress.slice(2, 4).toUpperCase()}
                                    <div className="absolute bottom-[-1px] right-[-1px] w-2 h-2 rounded-full border border-[#1a1d21] bg-[#23a559]" />
                                </div>
                                <span className="text-[14px] truncate">Client ({shortAddress(clientAddress)})</span>
                            </div>
                            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#202428] cursor-pointer transition-colors">
                                <div className="relative flex items-center justify-center w-5 h-5 rounded bg-[#2a2f3d] text-[10px] font-bold text-white overflow-hidden shrink-0">
                                    {freelancerAddress.slice(2, 4).toUpperCase()}
                                    <div className="absolute bottom-[-1px] right-[-1px] w-2 h-2 rounded-full border border-[#1a1d21] bg-[#23a559]" />
                                </div>
                                <span className="text-[14px] truncate">Freelancer ({shortAddress(freelancerAddress)})</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            <section className="flex-1 flex flex-col bg-[#11131a] min-w-0 h-full relative">
                <div className="px-4 py-2 border-b border-[#2a2f3d] bg-[#1a1d21] flex items-center justify-between shadow-sm shrink-0">
                    <div className="flex items-center gap-2 group cursor-pointer hover:bg-[#202428] px-2 py-1 -ml-2 rounded-md transition-colors">
                        <span className="font-bold text-[15px] text-[#f2f3f5]"># general</span>
                        <ChevronDown className="w-3.5 h-3.5 text-[#8a8e94] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-center gap-2 text-[#8a8e94]">
                        <div className="relative group/search hidden sm:block">
                            <div className="absolute flex items-center justify-center w-7 h-full left-0 pl-1">
                                <Search className="w-3.5 h-3.5 text-[#5c5f73]" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search"
                                className="w-[180px] h-7 bg-[#0b0c0f] border border-[#2a2f3d] rounded pl-7 pr-2 text-xs text-[#f2f3f5] focus:outline-none focus:border-[#4b4e60] focus:ring-1 focus:ring-[#4b4e60] transition-all"
                            />
                        </div>

                        {/* Meet button */}
                        <button
                            onClick={() => setMeetOpen(true)}
                            title="Start video meeting"
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#6366f1]/15 border border-[#6366f1]/30 text-[#a5b4fc] hover:bg-[#6366f1]/25 transition-all text-[11px] font-medium whitespace-nowrap"
                        >
                            <Video className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Meet</span>
                        </button>

                        <div className="px-2 py-1 rounded text-[11px] font-medium border border-[#2a2f3d] bg-[#0b0c0f] flex items-center gap-1.5 whitespace-nowrap">
                            <div className={`w-1.5 h-1.5 rounded-full ${isRefreshing ? 'bg-amber-400 animate-pulse' : 'bg-[#23a559]'}`} />
                            <span className="hidden sm:inline">XMTP</span> {XMTP_ENV.toUpperCase()}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 scroller-thin min-h-0">
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
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div key={message.id} className="flex gap-3 items-start group hover:bg-[#1a1c26] p-1.5 -mx-1.5 rounded-lg transition-colors">
                                    <div
                                        className="w-10 h-10 shrink-0 mt-0.5 rounded flex items-center justify-center font-bold text-[#eef1ff] shadow-sm"
                                        style={{ backgroundColor: message.isMine ? '#3a5f52' : '#2a2f3d' }}
                                    >
                                        {message.isMine ? normalizedCurrent.slice(2, 4).toUpperCase() : counterPartyAddress.slice(2, 4).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-bold text-[15px] text-[#f2f3f5]">
                                                {message.isMine ? "You" : shortAddress(counterPartyAddress)}
                                            </span>
                                            <span className="text-[11px] text-[#8a8e94]">
                                                {formatTime(message.sentAt)}
                                            </span>
                                        </div>
                                        <div className="text-[#dcdde1] text-[15px] leading-relaxed break-words mt-0.5">
                                            {message.isAudio ? (
                                                <div className="flex flex-col gap-1 mt-1">
                                                    <audio controls src={message.audioUrl} className="max-w-[400px] w-full h-10 rounded outline-none" style={{ filter: "invert(1) hue-rotate(180deg) brightness(1.2)" }} />
                                                </div>
                                            ) : (
                                                <p>{message.text}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-4 pb-4 pt-1 bg-[#11131a] w-full shrink-0">
                    <div className="border border-[#2a2f3d] rounded-xl bg-[#1a1d21] flex flex-col focus-within:border-[#4b4e60] transition-all shadow-sm">

                        <div className="flex items-center gap-1 border-b border-[#2a2f3d] px-2 py-1.5 text-[#9093a8] overflow-x-auto scroller-hidden">
                            <button className="p-1.5 rounded hover:bg-[#2a2f3d] transition-colors"><Bold className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 rounded hover:bg-[#2a2f3d] transition-colors"><Italic className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 rounded hover:bg-[#2a2f3d] transition-colors"><Strikethrough className="w-3.5 h-3.5" /></button>
                            <div className="w-px h-4 bg-[#2a2f3d] mx-1 shrink-0" />
                            <button className="p-1.5 rounded hover:bg-[#2a2f3d] transition-colors"><Link className="w-3.5 h-3.5" /></button>
                            <div className="w-px h-4 bg-[#2a2f3d] mx-1 shrink-0" />
                            <button className="p-1.5 rounded hover:bg-[#2a2f3d] transition-colors"><List className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 rounded hover:bg-[#2a2f3d] transition-colors"><ListOrdered className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 rounded hover:bg-[#2a2f3d] transition-colors"><LayoutList className="w-3.5 h-3.5" /></button>
                            <div className="w-px h-4 bg-[#2a2f3d] mx-1 shrink-0" />
                            <button className="p-1.5 rounded hover:bg-[#2a2f3d] transition-colors"><Code className="w-3.5 h-3.5" /></button>
                        </div>

                        <div className="min-h-[56px] flex items-center w-full px-3 py-2">
                            {isRecording ? (
                                <div className="flex items-center w-full gap-3 bg-[#11131a] rounded-lg px-3 py-2 border border-red-500/20">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                                    <span className="text-sm text-red-500 font-medium font-mono w-10">{formatDuration(recordingDuration)}</span>
                                    <div className="flex-1 text-xs text-[#8f90a6] pl-2 hidden sm:block">Recording voice message...</div>
                                    <div className="flex-1 sm:hidden" />
                                    <button onClick={cancelRecording} className="p-1.5 text-[#9093a8] hover:text-white rounded-md hover:bg-red-500/20 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={draft}
                                    onChange={(event) => setDraft(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" && !isSending && !isInitializing && !error && draft.trim()) {
                                            event.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder={`Message ${shortAddress(counterPartyAddress)}`}
                                    className="w-full bg-transparent border-none px-1 text-[15px] text-[#f0f0f5] placeholder:text-[#6a6c80] focus:outline-none focus:ring-0"
                                    disabled={isInitializing || !!error || isSending}
                                />
                            )}
                        </div>

                        <div className="flex items-center justify-between px-2 py-1.5">
                            <div className="flex items-center gap-1 text-[#9093a8]">
                                <button className="p-1.5 rounded-full hover:bg-[#2a2f3d] shrink-0 transition-colors"><Plus className="w-4 h-4" /></button>
                                <button className="p-1.5 rounded-full hover:bg-[#2a2f3d] shrink-0 hidden sm:block transition-colors"><Type className="w-4 h-4" /></button>
                                <button className="p-1.5 rounded-full hover:bg-[#2a2f3d] shrink-0 transition-colors"><Smile className="w-4 h-4" /></button>
                                <button className="p-1.5 rounded-full hover:bg-[#2a2f3d] shrink-0 transition-colors"><AtSign className="w-4 h-4" /></button>
                                {!draft.trim() && !isRecording && (
                                    <>
                                        <button className="p-1.5 rounded-full hover:bg-[#2a2f3d] shrink-0 transition-colors"><Paperclip className="w-4 h-4" /></button>
                                        <button onClick={startRecording} className="p-1.5 rounded-full hover:bg-[#2a2f3d] shrink-0 transition-colors"><Mic className="w-4 h-4" /></button>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-[#5c5f73] mr-2">
                                    <ShieldCheck className="w-3 h-3" />
                                    E2E Encrypted
                                </div>
                                {isRecording ? (
                                    <button onClick={stopRecording} className="w-8 h-8 rounded shrink-0 bg-[#25d366] text-[#0a2415] flex items-center justify-center hover:bg-[#2de06f] transition-colors">
                                        <Send className="w-3.5 h-3.5 ml-0.5" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSend}
                                        disabled={!draft.trim() || isInitializing || !!error || isSending}
                                        className={`w-8 h-8 rounded shrink-0 flex items-center justify-center transition-colors ${draft.trim() && !isInitializing && !error && !isSending
                                            ? "bg-[#25d366] text-[#0a2415] hover:bg-[#2de06f]"
                                            : "bg-[#2a2f3d] text-[#5c5f73] cursor-not-allowed"
                                            }`}
                                    >
                                        {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 ml-0.5" />}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    {statusHint && <p className="text-xs text-amber-400 mt-2 ml-1">{statusHint}</p>}
                    {error && <p className="text-xs text-red-400 mt-2 ml-1">{error}</p>}
                </div>
            </section>

            {/* Jitsi Meet Modal */}
            {meetOpen && (
                <JitsiMeetModal
                    roomName={meetRoomName}
                    displayName={currentUserAddress ? `${currentUserAddress.slice(0, 6)}…${currentUserAddress.slice(-4)}` : "FairWork User"}
                    onClose={() => setMeetOpen(false)}
                />
            )}
        </div>
    );
}
