"use client";

import { useEffect, useRef, useState } from "react";
import { X, Video, Loader2, Copy, Check } from "lucide-react";

type Props = {
    roomName: string;       // e.g. "fairwork-job-abc123"
    displayName?: string;   // user's display name
    onClose: () => void;
};

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        JitsiMeetExternalAPI: any;
    }
}

export default function JitsiMeetModal({ roomName, displayName, onClose }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const meetLink = `https://meet.jit.si/${roomName}`;

    const copyLink = () => {
        navigator.clipboard.writeText(meetLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        // Load Jitsi external API script
        const existing = document.getElementById("jitsi-api-script");
        if (existing) {
            initJitsi();
            return;
        }

        const script = document.createElement("script");
        script.id = "jitsi-api-script";
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;
        script.onload = () => initJitsi();
        script.onerror = () => setIsLoading(false);
        document.body.appendChild(script);

        return () => {
            if (apiRef.current) {
                apiRef.current.dispose();
                apiRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function initJitsi() {
        if (!containerRef.current || !window.JitsiMeetExternalAPI) return;

        apiRef.current = new window.JitsiMeetExternalAPI("meet.jit.si", {
            roomName,
            parentNode: containerRef.current,
            width: "100%",
            height: "100%",
            configOverwrite: {
                startWithAudioMuted: true,
                startWithVideoMuted: false,
                disableDeepLinking: true,
                prejoinPageEnabled: false,
            },
            interfaceConfigOverwrite: {
                TOOLBAR_BUTTONS: [
                    "microphone", "camera", "closedcaptions", "desktop",
                    "fullscreen", "fodeviceselection", "hangup", "chat",
                    "recording", "sharedvideo", "settings", "raisehand",
                    "videoquality", "filmstrip", "tileview", "download", "help",
                ],
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                BRAND_WATERMARK_LINK: "",
                DEFAULT_REMOTE_DISPLAY_NAME: "FairWork User",
                APP_NAME: "FairWork Meet",
            },
            userInfo: {
                displayName: displayName || "FairWork User",
            },
        });

        apiRef.current.addEventListener("videoConferenceJoined", () => {
            setIsLoading(false);
        });

        apiRef.current.addEventListener("readyToClose", () => {
            onClose();
        });

        // Fallback: hide loader after 5s even if event doesn't fire
        setTimeout(() => setIsLoading(false), 5000);
    }

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
        >
            <div className="w-full max-w-5xl bg-[#0a0a0f] border border-[#1a1a24] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                style={{ height: "min(85vh, 700px)" }}>

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a24] bg-[#0f0f1a] flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#6366f1]/20 border border-[#6366f1]/30 flex items-center justify-center">
                            <Video className="w-3.5 h-3.5 text-[#6366f1]" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-[#f0f0f5]">FairWork Meet</p>
                            <p className="text-[11px] text-[#8888a0] font-mono">{roomName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Copy link */}
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

                {/* Jitsi iframe container */}
                <div className="flex-1 relative bg-[#050508]">
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#050508] z-10">
                            <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
                            <p className="text-sm text-[#8888a0]">Connecting to meeting...</p>
                            <p className="text-xs text-[#555570]">Powered by Jitsi Meet · End-to-end encrypted</p>
                        </div>
                    )}
                    <div ref={containerRef} className="w-full h-full" />
                </div>
            </div>
        </div>
    );
}
