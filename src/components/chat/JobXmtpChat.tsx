"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Client, type DecodedMessage, type Dm, type Identifier, type Signer, type XmtpEnv } from "@xmtp/browser-sdk";
import { hexToBytes } from "viem";
import { useWalletClient } from "wagmi";
import { Loader2, Send, Search, Paperclip, Smile, ShieldCheck, Mic, Trash2, Bold, Italic, Strikethrough, Link, List, ListOrdered, Code, Type, AtSign, Plus, LayoutList, ChevronDown, Hash, Video, FileText, X, CheckCircle, AlertTriangle, Clock, Target, Scale, Printer, Download } from "lucide-react";
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
    jobId?: string;
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
    jobId,
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [transcriptData, setTranscriptData] = useState<any>(null);
    const [isGeneratingTranscript, setIsGeneratingTranscript] = useState(false);
    const [transcriptOpen, setTranscriptOpen] = useState(false);
    const [transcriptError, setTranscriptError] = useState<string | null>(null);

    const [legalReport, setLegalReport] = useState<string | null>(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);
    const [reportError, setReportError] = useState<string | null>(null);

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

    const generateTranscript = async () => {
        if (messages.length === 0) return;
        setIsGeneratingTranscript(true);
        setTranscriptError(null);
        setTranscriptOpen(true);

        try {
            const payload = {
                messages: messages.map((m) => ({
                    text: m.text,
                    isAudio: !!m.isAudio,
                    audioUrl: m.audioUrl || null,
                    isMine: m.isMine,
                    sentAt: m.sentAt,
                })),
                jobTitle,
                jobAmount,
            };

            const res = await fetch("/api/ai/transcript", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to generate transcript");
            }

            const data = await res.json();
            setTranscriptData(data.transcript);
        } catch (err) {
            setTranscriptError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsGeneratingTranscript(false);
        }
    };

    const generateLegalReport = async () => {
        if (!transcriptData) return;
        setIsGeneratingReport(true);
        setReportError(null);
        setReportOpen(true);

        try {
            const res = await fetch("/api/ai/legal-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    transcript: transcriptData,
                    jobTitle,
                    jobAmount,
                    clientAddress,
                    freelancerAddress,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to generate legal report");
            }

            const data = await res.json();
            setLegalReport(data.report);
        } catch (err) {
            setReportError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const handlePrintReport = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow || !legalReport) return;
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>FairWork Legal Report — ${jobTitle || "Project"}</title>
                <style>
                    body { font-family: 'Georgia', 'Times New Roman', serif; color: #1a1a2e; padding: 40px 60px; line-height: 1.7; max-width: 800px; margin: 0 auto; }
                    .legal-doc { }
                    .doc-header { text-align: center; border-bottom: 2px solid #1a1a2e; padding-bottom: 20px; margin-bottom: 30px; }
                    .doc-header h1 { font-size: 22px; letter-spacing: 2px; margin-bottom: 4px; }
                    .doc-header .subtitle { font-size: 14px; color: #555; margin: 4px 0; }
                    .doc-header .doc-meta { font-size: 12px; color: #666; margin: 2px 0; }
                    .doc-section { margin-bottom: 24px; }
                    .doc-section h2 { font-size: 15px; letter-spacing: 1px; border-bottom: 1px solid #ccc; padding-bottom: 6px; margin-bottom: 12px; }
                    .doc-section p, .doc-section li { font-size: 13px; }
                    .doc-section ul, .doc-section ol { padding-left: 24px; }
                    .doc-section li { margin-bottom: 6px; }
                    .doc-footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #1a1a2e; font-size: 11px; color: #888; text-align: center; }
                    .doc-footer .disclaimer { font-style: italic; margin-top: 8px; }
                    @media print { body { padding: 20px 40px; } }
                </style>
            </head>
            <body>${legalReport}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

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
        <div className="h-full flex border-0 overflow-hidden font-sans">
            <aside className="border-r border-[#e5e5ea] bg-[#f9f9fb] flex flex-col h-full text-[#555] w-[260px] shrink-0">
                {/* Header */}
                <div className="px-4 py-3.5 border-b border-[#e5e5ea] flex items-center justify-between hover:bg-[#f0f0f4] cursor-pointer transition-colors shadow-sm shrink-0">
                    <h3 className="font-bold text-[#1a1a2e] truncate">FairWork Workspace</h3>
                    <ChevronDown className="w-4 h-4 text-[#999]" />
                </div>

                {/* Channels & DMs */}
                <div className="flex-1 overflow-y-auto py-3 space-y-6 scroller-hidden">
                    {/* Job Info */}
                    <div className="px-3">
                        <h4 className="px-1 text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1">Job Details</h4>
                        <div className="px-2 py-1.5 rounded-md bg-white text-[#1a1a2e] border border-[#e5e5ea]">
                            <p className="text-[13px] font-medium truncate">{jobTitle || "Untitled Job"}</p>
                            {jobAmount && <p className="text-[11px] text-[#22c55e] mt-0.5">{jobAmount} USDC</p>}
                        </div>
                    </div>

                    {/* Channels */}
                    <div className="px-3">
                        <div className="flex items-center justify-between px-1 mb-1 group cursor-pointer">
                            <h4 className="text-[11px] font-semibold text-[#999] group-hover:text-[#333] uppercase tracking-wider transition-colors">Channels</h4>
                            <Plus className="w-3.5 h-3.5 text-[#999] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-[#e8e8f0] text-[#1a1a2e] cursor-pointer">
                                <Hash className="w-4 h-4 opacity-60" />
                                <span className="text-[14px] font-medium truncate">general</span>
                            </div>
                            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#f0f0f4] cursor-pointer transition-colors text-[#555]">
                                <Hash className="w-4 h-4 opacity-60" />
                                <span className="text-[14px] font-medium truncate">job-discussion</span>
                            </div>
                        </div>
                    </div>

                    {/* Direct Messages */}
                    <div className="px-3">
                        <div className="flex items-center justify-between px-1 mb-1 group cursor-pointer">
                            <h4 className="text-[11px] font-semibold text-[#999] group-hover:text-[#333] uppercase tracking-wider transition-colors">Direct messages</h4>
                            <Plus className="w-3.5 h-3.5 text-[#999] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#f0f0f4] cursor-pointer transition-colors text-[#1a1a2e]">
                                <div className="relative flex items-center justify-center w-5 h-5 rounded bg-[#22c55e] text-[10px] font-bold text-white overflow-hidden shrink-0">
                                    {clientAddress.slice(2, 4).toUpperCase()}
                                    <div className="absolute bottom-[-1px] right-[-1px] w-2 h-2 rounded-full border border-[#f9f9fb] bg-[#22c55e]" />
                                </div>
                                <span className="text-[14px] truncate">Client ({shortAddress(clientAddress)})</span>
                            </div>
                            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#f0f0f4] cursor-pointer transition-colors text-[#555]">
                                <div className="relative flex items-center justify-center w-5 h-5 rounded bg-[#6366f1] text-[10px] font-bold text-white overflow-hidden shrink-0">
                                    {freelancerAddress.slice(2, 4).toUpperCase()}
                                    <div className="absolute bottom-[-1px] right-[-1px] w-2 h-2 rounded-full border border-[#f9f9fb] bg-[#22c55e]" />
                                </div>
                                <span className="text-[14px] truncate">Freelancer ({shortAddress(freelancerAddress)})</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            <section className="flex-1 flex flex-col bg-[#ffffff] min-w-0 h-full relative">
                <div className="px-4 py-2 border-b border-[#e5e5ea] bg-[#fafafa] flex items-center justify-between shadow-sm shrink-0">
                    <div className="flex items-center gap-2 group cursor-pointer hover:bg-[#f0f0f4] px-2 py-1 -ml-2 rounded-md transition-colors">
                        <span className="font-bold text-[15px] text-[#1a1a2e]"># general</span>
                        <ChevronDown className="w-3.5 h-3.5 text-[#999] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-center gap-2 text-[#999]">
                        <div className="relative group/search hidden sm:block">
                            <div className="absolute flex items-center justify-center w-7 h-full left-0 pl-1">
                                <Search className="w-3.5 h-3.5 text-[#bbb]" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search"
                                className="w-[180px] h-7 bg-white border border-[#e5e5ea] rounded pl-7 pr-2 text-xs text-[#1a1a2e] focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/30 transition-all"
                            />
                        </div>

                        {/* Meet button */}
                        <button
                            onClick={() => setMeetOpen(true)}
                            title="Start video meeting"
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#d4a017] text-white hover:bg-[#c59515] transition-all text-[11px] font-semibold whitespace-nowrap shadow-sm"
                        >
                            <Video className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Meet</span>
                        </button>

                        {/* Transcript button */}
                        <button
                            onClick={generateTranscript}
                            disabled={isGeneratingTranscript || messages.length === 0}
                            title="Generate AI transcript"
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#22c55e] text-white hover:bg-[#1ea34e] transition-all text-[11px] font-semibold whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                        >
                            {isGeneratingTranscript ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">{isGeneratingTranscript ? "Analyzing..." : "Transcript"}</span>
                        </button>

                        <div className="px-2 py-1 rounded text-[11px] font-medium border border-[#e5e5ea] bg-white flex items-center gap-1.5 whitespace-nowrap text-[#555]">
                            <div className={`w-1.5 h-1.5 rounded-full ${isRefreshing ? 'bg-amber-400 animate-pulse' : 'bg-[#22c55e]'}`} />
                            <span className="hidden sm:inline">XMTP</span> {XMTP_ENV.toUpperCase()}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 scroller-thin min-h-0">
                    {isInitializing ? (
                        <div className="h-full flex items-center justify-center text-sm text-[#999] gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Initializing XMTP chat...
                        </div>
                    ) : error ? (
                        <div className="space-y-3">
                            <div className="text-sm text-red-500">{error}</div>
                            <button
                                onClick={() => void initializeChat()}
                                className="px-3 py-2 rounded-lg border border-[#e5e5ea] text-xs text-[#555] hover:bg-[#f5f5f5]"
                            >
                                Retry XMTP Connection
                            </button>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-sm text-[#999]">
                            No messages yet. Start the conversation.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div key={message.id} className="flex gap-3 items-start group hover:bg-[#f5f5f8] p-1.5 -mx-1.5 rounded-lg transition-colors">
                                    <div
                                        className="w-10 h-10 shrink-0 mt-0.5 rounded flex items-center justify-center font-bold text-white shadow-sm"
                                        style={{ backgroundColor: message.isMine ? '#d4a017' : '#22c55e' }}
                                    >
                                        {message.isMine ? normalizedCurrent.slice(2, 4).toUpperCase() : counterPartyAddress.slice(2, 4).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-bold text-[15px] text-[#1a1a2e]">
                                                {message.isMine ? "You" : shortAddress(counterPartyAddress)}
                                            </span>
                                            <span className="text-[11px] text-[#999]">
                                                {formatTime(message.sentAt)}
                                            </span>
                                        </div>
                                        <div className="text-[#333] text-[15px] leading-relaxed break-words mt-0.5">
                                            {message.isAudio ? (
                                                <div className="flex flex-col gap-1 mt-1">
                                                    <audio controls src={message.audioUrl} className="max-w-[400px] w-full h-10 rounded outline-none" />
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

                <div className="px-4 pb-4 pt-1 bg-white w-full shrink-0">
                    <div className="border border-[#e5e5ea] rounded-xl bg-white flex flex-col focus-within:border-[#6366f1] transition-all shadow-sm">

                        <div className="flex items-center gap-1 border-b border-[#e5e5ea] px-2 py-1.5 text-[#999] overflow-x-auto scroller-hidden">
                            <button className="p-1.5 rounded hover:bg-[#f0f0f4] transition-colors"><Bold className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 rounded hover:bg-[#f0f0f4] transition-colors"><Italic className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 rounded hover:bg-[#f0f0f4] transition-colors"><Strikethrough className="w-3.5 h-3.5" /></button>
                            <div className="w-px h-4 bg-[#e5e5ea] mx-1 shrink-0" />
                            <button className="p-1.5 rounded hover:bg-[#f0f0f4] transition-colors"><Link className="w-3.5 h-3.5" /></button>
                            <div className="w-px h-4 bg-[#e5e5ea] mx-1 shrink-0" />
                            <button className="p-1.5 rounded hover:bg-[#f0f0f4] transition-colors"><List className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 rounded hover:bg-[#f0f0f4] transition-colors"><ListOrdered className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 rounded hover:bg-[#f0f0f4] transition-colors"><LayoutList className="w-3.5 h-3.5" /></button>
                            <div className="w-px h-4 bg-[#e5e5ea] mx-1 shrink-0" />
                            <button className="p-1.5 rounded hover:bg-[#f0f0f4] transition-colors"><Code className="w-3.5 h-3.5" /></button>
                        </div>

                        <div className="min-h-[56px] flex items-center w-full px-3 py-2">
                            {isRecording ? (
                                <div className="flex items-center w-full gap-3 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                                    <span className="text-sm text-red-600 font-medium font-mono w-10">{formatDuration(recordingDuration)}</span>
                                    <div className="flex-1 text-xs text-[#999] pl-2 hidden sm:block">Recording voice message...</div>
                                    <div className="flex-1 sm:hidden" />
                                    <button onClick={cancelRecording} className="p-1.5 text-[#999] hover:text-red-600 rounded-md hover:bg-red-50 transition-colors">
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
                                    className="w-full bg-transparent border-none px-1 text-[15px] text-[#1a1a2e] placeholder:text-[#bbb] focus:outline-none focus:ring-0"
                                    disabled={isInitializing || !!error || isSending}
                                />
                            )}
                        </div>

                        <div className="flex items-center justify-between px-2 py-1.5">
                            <div className="flex items-center gap-1 text-[#999]">
                                <button className="p-1.5 rounded-full hover:bg-[#f0f0f4] shrink-0 transition-colors"><Plus className="w-4 h-4" /></button>
                                <button className="p-1.5 rounded-full hover:bg-[#f0f0f4] shrink-0 hidden sm:block transition-colors"><Type className="w-4 h-4" /></button>
                                <button className="p-1.5 rounded-full hover:bg-[#f0f0f4] shrink-0 transition-colors"><Smile className="w-4 h-4" /></button>
                                <button className="p-1.5 rounded-full hover:bg-[#f0f0f4] shrink-0 transition-colors"><AtSign className="w-4 h-4" /></button>
                                {!draft.trim() && !isRecording && (
                                    <>
                                        <button className="p-1.5 rounded-full hover:bg-[#f0f0f4] shrink-0 transition-colors"><Paperclip className="w-4 h-4" /></button>
                                        <button onClick={startRecording} className="p-1.5 rounded-full hover:bg-[#f0f0f4] shrink-0 transition-colors"><Mic className="w-4 h-4" /></button>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-[#bbb] mr-2">
                                    <ShieldCheck className="w-3 h-3" />
                                    E2E Encrypted
                                </div>
                                {isRecording ? (
                                    <button onClick={stopRecording} className="w-8 h-8 rounded shrink-0 bg-[#d4a017] text-white flex items-center justify-center hover:bg-[#c59515] transition-colors">
                                        <Send className="w-3.5 h-3.5 ml-0.5" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSend}
                                        disabled={!draft.trim() || isInitializing || !!error || isSending}
                                        className={`w-8 h-8 rounded shrink-0 flex items-center justify-center transition-colors ${draft.trim() && !isInitializing && !error && !isSending
                                            ? "bg-[#d4a017] text-white hover:bg-[#c59515]"
                                            : "bg-[#f0f0f4] text-[#ccc] cursor-not-allowed"
                                            }`}
                                    >
                                        {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 ml-0.5" />}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    {statusHint && <p className="text-xs text-amber-600 mt-2 ml-1">{statusHint}</p>}
                    {error && <p className="text-xs text-red-500 mt-2 ml-1">{error}</p>}
                </div>
            </section>

            {/* Transcript Modal */}
            {transcriptOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white border border-[#e5e5ea] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col mx-4">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e5ea] bg-[#fafafa] rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-[#22c55e]" />
                                </div>
                                <h2 className="text-[16px] font-bold text-[#1a1a2e]">AI Project Transcript</h2>
                            </div>
                            <button onClick={() => setTranscriptOpen(false)} className="p-1.5 rounded-lg hover:bg-[#f0f0f4] text-[#999] hover:text-[#333] transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 scroller-thin">
                            {isGeneratingTranscript ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#22c55e]" />
                                    <div className="text-center">
                                        <p className="text-[15px] text-[#1a1a2e] font-medium">Generating transcript...</p>
                                        <p className="text-[13px] text-[#999] mt-1">AI is analyzing {messages.length} messages</p>
                                    </div>
                                </div>
                            ) : transcriptError ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-3">
                                    <AlertTriangle className="w-8 h-8 text-red-500" />
                                    <p className="text-sm text-red-500">{transcriptError}</p>
                                    <button onClick={generateTranscript} className="mt-2 px-4 py-2 rounded-lg bg-[#f5f5f5] border border-[#e5e5ea] text-[13px] text-[#333] hover:bg-[#eee] transition-colors">Retry</button>
                                </div>
                            ) : transcriptData ? (
                                <>
                                    {/* Project Summary */}
                                    <div className="rounded-xl bg-[#f0fdf4] border border-[#dcfce7] p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-7 h-7 rounded-full bg-[#22c55e]/15 flex items-center justify-center shrink-0">
                                                <Target className="w-3.5 h-3.5 text-[#22c55e]" />
                                            </div>
                                            <h3 className="text-[14px] font-semibold text-[#1a1a2e]">Project Summary</h3>
                                        </div>
                                        <p className="text-[13px] text-[#555] leading-relaxed ml-10">{transcriptData.summary}</p>
                                    </div>

                                    {/* Key Decisions */}
                                    {transcriptData.decisions?.length > 0 && (
                                        <div className="rounded-xl bg-[#eff6ff] border border-[#dbeafe] p-4">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-7 h-7 rounded-full bg-[#3b82f6]/15 flex items-center justify-center shrink-0">
                                                    <CheckCircle className="w-3.5 h-3.5 text-[#3b82f6]" />
                                                </div>
                                                <h3 className="text-[14px] font-semibold text-[#1a1a2e]">Key Decisions</h3>
                                            </div>
                                            <ul className="space-y-2 ml-10">
                                                {transcriptData.decisions.map((d: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-[13px] text-[#555]">
                                                        <span className="text-[#3b82f6] mt-0.5">•</span>
                                                        <span>{d}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Action Items + Timeline — Side by Side */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Action Items */}
                                        {transcriptData.actionItems?.length > 0 && (
                                            <div className="rounded-xl bg-[#fffbeb] border border-[#fef3c7] p-4">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-7 h-7 rounded-full bg-[#f59e0b]/15 flex items-center justify-center shrink-0">
                                                        <CheckCircle className="w-3.5 h-3.5 text-[#f59e0b]" />
                                                    </div>
                                                    <h3 className="text-[14px] font-semibold text-[#1a1a2e]">Action Items</h3>
                                                </div>
                                                <ul className="space-y-2.5 ml-1">
                                                    {transcriptData.actionItems.map((item: string, i: number) => (
                                                        <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#555]">
                                                            <div className="w-4 h-4 rounded border border-[#f59e0b]/50 mt-0.5 shrink-0" />
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Timeline */}
                                        {transcriptData.timeline?.length > 0 && (
                                            <div className="rounded-xl bg-[#f5f3ff] border border-[#ede9fe] p-4">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-7 h-7 rounded-full bg-[#8b5cf6]/15 flex items-center justify-center shrink-0">
                                                        <Clock className="w-3.5 h-3.5 text-[#8b5cf6]" />
                                                    </div>
                                                    <h3 className="text-[14px] font-semibold text-[#1a1a2e]">Timeline</h3>
                                                </div>
                                                <ul className="space-y-2.5 ml-1">
                                                    {transcriptData.timeline.map((t: string, i: number) => (
                                                        <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#555]">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] mt-1.5 shrink-0" />
                                                            <span>{t}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Concerns & Risks */}
                                    {transcriptData.concerns?.length > 0 && (
                                        <div className="rounded-xl bg-[#fef2f2] border border-[#fecaca] p-4">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-7 h-7 rounded-full bg-[#ef4444]/15 flex items-center justify-center shrink-0">
                                                    <AlertTriangle className="w-3.5 h-3.5 text-[#ef4444]" />
                                                </div>
                                                <h3 className="text-[14px] font-semibold text-[#1a1a2e]">Concerns & Risks</h3>
                                            </div>
                                            <p className="text-[13px] text-[#555] leading-relaxed ml-10">
                                                {transcriptData.concerns.map((c: string, i: number) => (
                                                    <span key={i}>{c}{i < transcriptData.concerns.length - 1 ? ". " : ""}</span>
                                                ))}
                                            </p>
                                        </div>
                                    )}

                                    {/* Participant Roles */}
                                    {transcriptData.participants && (
                                        <div className="rounded-xl bg-[#f9fafb] border border-[#e5e7eb] p-4">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-7 h-7 rounded-full bg-[#6b7280]/10 flex items-center justify-center shrink-0">
                                                    <Hash className="w-3.5 h-3.5 text-[#6b7280]" />
                                                </div>
                                                <h3 className="text-[14px] font-semibold text-[#1a1a2e]">Participant Roles</h3>
                                            </div>
                                            <div className="space-y-1.5 text-[13px] text-[#555] ml-10">
                                                <p><span className="text-[#22c55e] font-medium">Client:</span> {transcriptData.participants.client}</p>
                                                <p><span className="text-[#3b82f6] font-medium">Freelancer:</span> {transcriptData.participants.freelancer}</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : null}
                        </div>

                        {/* Modal Footer */}
                        {transcriptData && !isGeneratingTranscript && (
                            <div className="px-5 py-3 border-t border-[#e5e5ea] bg-[#fafafa] rounded-b-2xl flex items-center justify-between">
                                <p className="text-[11px] text-[#999] flex items-center gap-1"><span className="text-[#22c55e]">●</span> Generated by AI. Verify critical information independently.</p>
                                <div className="flex items-center gap-2">
                                    <button onClick={generateTranscript} className="px-3.5 py-1.5 rounded-lg bg-[#f5f5f5] border border-[#e5e5ea] text-[#555] text-[12px] font-medium hover:bg-[#eee] transition-colors">Regenerate</button>
                                    <button
                                        onClick={generateLegalReport}
                                        disabled={isGeneratingReport}
                                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#6366f1] text-white text-[12px] font-medium hover:bg-[#5558e6] transition-colors disabled:opacity-50"
                                    >
                                        {isGeneratingReport ? <Loader2 className="w-3 h-3 animate-spin" /> : <Scale className="w-3 h-3" />}
                                        Legal Report
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Legal Report Modal */}
            {reportOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-[#fefefe] border border-[#e0e0e0] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col mx-4">
                        {/* Report Header */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e0e0e0] bg-[#f8f8fa] rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 flex items-center justify-center">
                                    <Scale className="w-4 h-4 text-[#6366f1]" />
                                </div>
                                <h2 className="text-[15px] font-bold text-[#1a1a2e]">Legal Project Report</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                {legalReport && (
                                    <button onClick={handlePrintReport} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#6366f1] text-white text-[12px] font-semibold hover:bg-[#5558e6] transition-colors shadow-sm">
                                        <Printer className="w-3.5 h-3.5" />
                                        Print / PDF
                                    </button>
                                )}
                                <button onClick={() => setReportOpen(false)} className="p-1.5 rounded-lg hover:bg-[#e8e8ec] text-[#888] hover:text-[#333] transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Report Body */}
                        <div className="flex-1 overflow-y-auto px-10 py-8 bg-white">
                            {isGeneratingReport ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#6366f1]" />
                                    <div className="text-center">
                                        <p className="text-[15px] text-[#1a1a2e] font-medium">Generating legal report...</p>
                                        <p className="text-[13px] text-[#888] mt-1">Nugen AI is drafting the document</p>
                                    </div>
                                </div>
                            ) : reportError ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-3">
                                    <AlertTriangle className="w-8 h-8 text-red-500" />
                                    <p className="text-sm text-red-500">{reportError}</p>
                                    <button onClick={generateLegalReport} className="mt-2 px-4 py-2 rounded-lg bg-[#f0f0f4] border border-[#ddd] text-[13px] text-[#333] hover:bg-[#e8e8ec] transition-colors">Retry</button>
                                </div>
                            ) : legalReport ? (
                                <>
                                    <style>{`
                                        .legal-report-content .legal-doc { }
                                        .legal-report-content .doc-header { text-align: center; border-bottom: 2px solid #1a1a2e; padding-bottom: 24px; margin-bottom: 32px; }
                                        .legal-report-content .doc-header h1 { font-size: 24px; letter-spacing: 3px; margin-bottom: 6px; font-weight: 700; text-transform: uppercase; }
                                        .legal-report-content .doc-header .subtitle { font-size: 14px; color: #6366f1; margin: 6px 0; font-style: italic; }
                                        .legal-report-content .doc-header .doc-meta { font-size: 11px; color: #777; margin: 3px 0; letter-spacing: 0.5px; display: inline; }
                                        .legal-report-content .doc-header .doc-meta + .doc-meta::before { content: '  •  '; }
                                        .legal-report-content .doc-section { margin-bottom: 28px; }
                                        .legal-report-content .doc-section h2 { font-size: 14px; letter-spacing: 1.5px; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 14px; font-weight: 700; text-transform: uppercase; color: #1a1a2e; }
                                        .legal-report-content .doc-section p { font-size: 13px; margin-bottom: 10px; color: #333; }
                                        .legal-report-content .doc-section ul, .legal-report-content .doc-section ol { padding-left: 24px; margin-bottom: 14px; }
                                        .legal-report-content .doc-section li { font-size: 13px; margin-bottom: 8px; color: #333; }
                                        .legal-report-content .doc-section strong { color: #1a1a2e; }
                                        .legal-report-content .doc-footer { margin-top: 48px; padding-top: 24px; border-top: 2px solid #1a1a2e; font-size: 11px; color: #999; text-align: center; }
                                        .legal-report-content .doc-footer .disclaimer { font-style: italic; margin-top: 8px; color: #aaa; }
                                    `}</style>
                                    <div
                                        className="legal-report-content max-w-none"
                                        style={{
                                            fontFamily: "'Georgia', 'Times New Roman', serif",
                                            color: "#1a1a2e",
                                            lineHeight: 1.8,
                                        }}
                                        dangerouslySetInnerHTML={{ __html: legalReport }}
                                    />
                                </>
                            ) : null}
                        </div>

                        {/* Report Footer */}
                        {legalReport && !isGeneratingReport && (
                            <div className="px-5 py-3 border-t border-[#e0e0e0] bg-[#f8f8fa] rounded-b-2xl flex items-center justify-between">
                                <p className="text-[11px] text-[#999] flex items-center gap-1"><span className="text-[#6366f1]">●</span> AI-generated document • Not legal advice • Review before use</p>
                                <button onClick={generateLegalReport} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#f0f0f4] border border-[#ddd] text-[#6366f1] text-[12px] font-medium hover:bg-[#e8e8ec] transition-colors">
                                    <Scale className="w-3 h-3" />
                                    Regenerate
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Jitsi Meet Modal */}
            {meetOpen && (
                <JitsiMeetModal
                    roomName={meetRoomName}
                    displayName={currentUserAddress ? `${currentUserAddress.slice(0, 6)}…${currentUserAddress.slice(-4)}` : "FairWork User"}
                    jobId={jobId}
                    walletAddress={currentUserAddress}
                    isModerator={normalizedCurrent === normalizedClient}
                    onClose={() => setMeetOpen(false)}
                />
            )}
        </div>
    );
}
