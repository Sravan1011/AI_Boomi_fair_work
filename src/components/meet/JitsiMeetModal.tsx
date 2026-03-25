"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Video, Loader2, Copy, Check, Circle, FileText, ChevronRight } from "lucide-react";

type Props = {
    roomName:              string;
    displayName?:          string;
    jobId?:                string;
    walletAddress?:        string;
    isModerator?:          boolean;
    onClose:               () => void;
    onRecordingComplete?:  (ipfsCid: string, transcript: string) => void;
};

type TranscriptChunk = {
    speaker: string;
    text:    string;
    time:    string; // HH:MM:SS
};

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        JitsiMeetExternalAPI: any;
    }
}

function formatTime(date: Date) {
    return date.toTimeString().slice(0, 8); // HH:MM:SS
}

export default function JitsiMeetModal({
    roomName,
    displayName,
    jobId,
    walletAddress,
    isModerator = false,
    onClose,
    onRecordingComplete,
}: Props) {
    const containerRef   = useRef<HTMLDivElement>(null);
    const transcriptRef  = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiRef         = useRef<any>(null);
    const chunksRef      = useRef<TranscriptChunk[]>([]);

    const [isLoading,      setIsLoading]      = useState(true);
    const [copied,         setCopied]         = useState(false);
    const [isRecording,    setIsRecording]    = useState(false);
    const [statusMsg,      setStatusMsg]      = useState("");
    const [token,          setToken]          = useState<string | null | undefined>(undefined);
    const [transcriptOpen, setTranscriptOpen] = useState(false);
    const [chunks,         setChunks]         = useState<TranscriptChunk[]>([]);

    const appId   = process.env.NEXT_PUBLIC_JAAS_APP_ID;
    const useJaaS = !!appId;

    const meetLink = useJaaS
        ? `https://8x8.vc/${appId}/${roomName}`
        : `https://meet.jit.si/${roomName}`;

    // ── Fetch JaaS JWT ──────────────────────────────────────────
    useEffect(() => {
        if (!useJaaS) { setToken(null); return; }
        (async () => {
            try {
                const res = await fetch("/api/meet/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        roomName,
                        displayName: displayName || walletAddress || "FairWork User",
                        isModerator,
                    }),
                });
                const { token: t } = await res.json();
                setToken(t ?? null);
            } catch {
                setToken(null);
            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomName]);

    // ── Auto-scroll transcript panel ────────────────────────────
    useEffect(() => {
        if (transcriptOpen && transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
    }, [chunks, transcriptOpen]);

    // ── Save transcript to Supabase when meeting ends ───────────
    const saveTranscript = useCallback(async (finalChunks: TranscriptChunk[]) => {
        if (!jobId || !walletAddress) return;

        const transcriptText = finalChunks.length > 0
            ? finalChunks.map(c => `[${c.time}] ${c.speaker}: ${c.text}`).join("\n")
            : "";

        if (!transcriptText) return;

        setStatusMsg("Saving transcript…");
        try {
            const res = await fetch("/api/meet/recordings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jobId,
                    roomName,
                    recordedBy: walletAddress,
                    transcript: transcriptText,   // pass directly — no Whisper needed
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setStatusMsg(`Transcript saved ✓ (${finalChunks.length} lines)`);
                onRecordingComplete?.(data.ipfsCid ?? "", transcriptText);
            } else {
                setStatusMsg("Save failed");
            }
        } catch {
            setStatusMsg("Save failed");
        }
    }, [jobId, roomName, walletAddress, onRecordingComplete]);

    // ── Load external API + init ────────────────────────────────
    useEffect(() => {
        if (token === undefined) return;

        const scriptId  = "jitsi-api-script";
        const scriptSrc = useJaaS
            ? "https://8x8.vc/libs/external_api.min.js"
            : "https://meet.jit.si/external_api.js";

        const existing = document.getElementById(scriptId);
        if (existing) { initJitsi(); return; }

        const script   = document.createElement("script");
        script.id      = scriptId;
        script.src     = scriptSrc;
        script.async   = true;
        script.onload  = () => initJitsi();
        script.onerror = () => setIsLoading(false);
        document.body.appendChild(script);

        return () => {
            if (apiRef.current) { apiRef.current.dispose(); apiRef.current = null; }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    function initJitsi() {
        if (!containerRef.current || !window.JitsiMeetExternalAPI) return;

        const domain   = useJaaS ? "8x8.vc" : "meet.jit.si";
        const fullRoom = useJaaS && appId ? `${appId}/${roomName}` : roomName;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const config: Record<string, any> = {
            roomName:   fullRoom,
            parentNode: containerRef.current,
            width:      "100%",
            height:     "100%",
            configOverwrite: {
                startWithAudioMuted: true,
                startWithVideoMuted: false,
                disableDeepLinking:  true,
                prejoinPageEnabled:  false,
                liveStreamingEnabled: false,
            },
            interfaceConfigOverwrite: {
                TOOLBAR_BUTTONS: [
                    "microphone", "camera", "desktop",
                    "fullscreen", "fodeviceselection", "hangup", "chat",
                    "sharedvideo", "settings", "raisehand",
                    "videoquality", "filmstrip", "tileview", "help",
                ],
                SHOW_JITSI_WATERMARK:        false,
                SHOW_WATERMARK_FOR_GUESTS:   false,
                BRAND_WATERMARK_LINK:        "",
                DEFAULT_REMOTE_DISPLAY_NAME: "FairWork User",
                APP_NAME:                    "FairWork Meet",
            },
            userInfo: { displayName: displayName || "FairWork User" },
        };

        if (useJaaS && token) config.jwt = token;

        apiRef.current = new window.JitsiMeetExternalAPI(domain, config);

        // ── Meeting joined ──────────────────────────────────────
        apiRef.current.addEventListener("videoConferenceJoined", () => setIsLoading(false));

        // ── Live transcript chunks ──────────────────────────────
        apiRef.current.addEventListener(
            "transcriptionChunkReceived",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (data: { participant: { displayName: string }; text: string; final: boolean }) => {
                if (!data.final) return; // skip interim results
                const chunk: TranscriptChunk = {
                    speaker: data.participant?.displayName || "Unknown",
                    text:    data.text.trim(),
                    time:    formatTime(new Date()),
                };
                if (!chunk.text) return;
                chunksRef.current = [...chunksRef.current, chunk];
                setChunks([...chunksRef.current]);
            }
        );

        // ── Recording status ────────────────────────────────────
        apiRef.current.addEventListener(
            "recordingStatusChanged",
            ({ on, mode }: { on: boolean; mode: string }) => {
                if (mode === "file") {
                    setIsRecording(on);
                    setStatusMsg(on ? "Recording in progress…" : "Recording stopped");
                }
            }
        );

        // ── Meeting closed → save transcript ───────────────────
        apiRef.current.addEventListener("readyToClose", () => {
            saveTranscript(chunksRef.current);
            onClose();
        });

        setTimeout(() => setIsLoading(false), 5000);
    }

    const copyLink = () => {
        navigator.clipboard.writeText(meetLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadTranscript = () => {
        if (chunks.length === 0) return;
        const text = chunks.map(c => `[${c.time}] ${c.speaker}: ${c.text}`).join("\n");
        const blob = new Blob([text], { type: "text/plain" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href     = url;
        a.download = `transcript-${roomName}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
        >
            <div
                className="w-full max-w-6xl bg-[#0a0a0f] border border-[#1a1a24] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                style={{ height: "min(88vh, 740px)" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a24] bg-[#0f0f1a] flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#6366f1]/20 border border-[#6366f1]/30 flex items-center justify-center">
                            <Video className="w-3.5 h-3.5 text-[#6366f1]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-[#f0f0f5]">FairWork Meet</p>
                                {useJaaS && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E9F9F0] text-[#1DBF73] border border-[#1DBF73]/30">
                                        JaaS
                                    </span>
                                )}
                                {isRecording && (
                                    <span className="flex items-center gap-1 text-[10px] text-red-400">
                                        <Circle className="w-2 h-2 fill-red-500 text-red-500 animate-pulse" />
                                        REC
                                    </span>
                                )}
                                {chunks.length > 0 && (
                                    <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        LIVE TRANSCRIPT
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-[#8888a0] font-mono">{roomName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {statusMsg && (
                            <span className="text-xs text-[#8888a0] max-w-[200px] truncate">{statusMsg}</span>
                        )}
                        {/* Transcript toggle */}
                        <button
                            onClick={() => setTranscriptOpen(o => !o)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                                transcriptOpen
                                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                    : "border-[#2a2a35] text-[#8888a0] hover:text-[#f0f0f5] hover:border-[#6366f1]/40"
                            }`}
                        >
                            <FileText className="w-3.5 h-3.5" />
                            Transcript {chunks.length > 0 && `(${chunks.length})`}
                        </button>
                        <button
                            onClick={copyLink}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2a2a35] text-xs text-[#8888a0] hover:text-[#f0f0f5] hover:border-[#6366f1]/40 transition-all"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? "Copied!" : "Copy link"}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-[#1a1a24] hover:bg-red-500/20 hover:border-red-500/30 border border-[#2a2a35] flex items-center justify-center transition-all"
                        >
                            <X className="w-4 h-4 text-[#8888a0] hover:text-red-400" />
                        </button>
                    </div>
                </div>

                {/* Body: meet + transcript panel */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Jitsi */}
                    <div className="flex-1 relative bg-[#050508]">
                        {isLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#050508] z-10">
                                <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
                                <p className="text-sm text-[#8888a0]">Connecting to meeting…</p>
                                <p className="text-xs text-[#555570]">
                                    {useJaaS
                                        ? "Powered by JaaS · Unlimited · Auto-transcribed for evidence"
                                        : "Powered by Jitsi Meet · End-to-end encrypted"
                                    }
                                </p>
                            </div>
                        )}
                        <div ref={containerRef} className="w-full h-full" />
                    </div>

                    {/* Live Transcript Panel */}
                    {transcriptOpen && (
                        <div className="w-72 flex-shrink-0 border-l border-[#1a1a24] bg-[#080810] flex flex-col">
                            {/* Panel header */}
                            <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#1a1a24] flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-xs font-semibold text-[#f0f0f5]">Live Transcript</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {chunks.length > 0 && (
                                        <button
                                            onClick={downloadTranscript}
                                            className="text-[10px] px-2 py-1 rounded border border-[#2a2a35] text-[#8888a0] hover:text-[#f0f0f5] hover:border-[#6366f1]/40 transition-all"
                                        >
                                            Save
                                        </button>
                                    )}
                                    <button onClick={() => setTranscriptOpen(false)}>
                                        <ChevronRight className="w-4 h-4 text-[#555570] hover:text-[#8888a0]" />
                                    </button>
                                </div>
                            </div>

                            {/* Transcript lines */}
                            <div
                                ref={transcriptRef}
                                className="flex-1 overflow-y-auto p-3 space-y-3 text-xs"
                            >
                                {chunks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-2 text-[#555570]">
                                        <FileText className="w-6 h-6 opacity-40" />
                                        <p className="text-center leading-relaxed">
                                            Transcript will appear here<br />
                                            when participants speak
                                        </p>
                                        <p className="text-[10px] text-[#444458] text-center">
                                            Enable captions in the<br />meeting toolbar to start
                                        </p>
                                    </div>
                                ) : (
                                    chunks.map((chunk, i) => (
                                        <div key={i} className="group">
                                            <div className="flex items-baseline gap-1.5 mb-0.5">
                                                <span className="font-semibold text-[#6366f1] text-[11px] truncate max-w-[120px]">
                                                    {chunk.speaker}
                                                </span>
                                                <span className="text-[10px] text-[#444458] font-mono flex-shrink-0">
                                                    {chunk.time}
                                                </span>
                                            </div>
                                            <p className="text-[#c0c0d0] leading-relaxed pl-0.5">
                                                {chunk.text}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            {chunks.length > 0 && (
                                <div className="px-3 py-2 border-t border-[#1a1a24] flex-shrink-0">
                                    <p className="text-[10px] text-[#444458] text-center">
                                        Auto-saved to Supabase on meeting end
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
