import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Audio Transcription
 * POST /api/transcribe
 *
 * Primary:  Groq Whisper (free, fast) — whisper-large-v3-turbo
 * Fallback: OpenAI Whisper — whisper-1
 *
 * Accepts:
 *   - FormData with `file` (mp3, mp4, webm, wav, m4a, ogg — max 25 MB)
 *   - OR JSON with `base64` + `mimeType` (voice messages from XMTP)
 *
 * Returns: { transcript: string, provider: "groq" | "openai" }
 */
export async function POST(request: NextRequest) {
    const groqKey   = process.env.GROQ_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    if (!groqKey && !openAiKey) {
        return NextResponse.json(
            { error: "No transcription API key configured. Set GROQ_API_KEY or OPENAI_API_KEY." },
            { status: 503 }
        );
    }

    try {
        const contentType = request.headers.get("content-type") ?? "";
        let audioFile: File;

        if (contentType.includes("multipart/form-data")) {
            // ── Direct file upload ────────────────────────────────
            const form = await request.formData();
            const file = form.get("file");
            if (!file || !(file instanceof File)) {
                return NextResponse.json({ error: "No file provided" }, { status: 400 });
            }
            audioFile = file;
        } else {
            // ── Base64 JSON payload (voice messages from XMTP) ───
            const { base64, mimeType = "audio/webm" } = await request.json();
            if (!base64) {
                return NextResponse.json({ error: "No base64 audio provided" }, { status: 400 });
            }
            const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
            const binaryStr  = atob(base64Data);
            const bytes      = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
            const ext = mimeType.split("/")[1]?.split(";")[0] ?? "webm";
            audioFile = new File([bytes], `voice_message.${ext}`, { type: mimeType });
        }

        // 25 MB limit (both Groq and OpenAI Whisper)
        if (audioFile.size > 25 * 1024 * 1024) {
            return NextResponse.json(
                { error: "Audio file exceeds 25 MB limit" },
                { status: 413 }
            );
        }

        // ── Try Groq first (free) ─────────────────────────────────
        if (groqKey) {
            try {
                const transcript = await callWhisper(
                    "https://api.groq.com/openai/v1/audio/transcriptions",
                    "whisper-large-v3-turbo",
                    groqKey,
                    audioFile
                );
                return NextResponse.json({ transcript, provider: "groq" });
            } catch (groqErr) {
                console.warn("Groq transcription failed, falling back to OpenAI:", groqErr);
            }
        }

        // ── Fallback: OpenAI Whisper ──────────────────────────────
        if (openAiKey) {
            const transcript = await callWhisper(
                "https://api.openai.com/v1/audio/transcriptions",
                "whisper-1",
                openAiKey,
                audioFile
            );
            return NextResponse.json({ transcript, provider: "openai" });
        }

        throw new Error("All transcription providers failed");

    } catch (error) {
        console.error("Transcription error:", error);
        return NextResponse.json(
            { error: "Transcription failed", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

async function callWhisper(url: string, model: string, apiKey: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("model", model);
    formData.append("response_format", "text");
    formData.append("language", "en");

    const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
    });

    if (!res.ok) throw new Error(`${model} error ${res.status}: ${await res.text()}`);
    return (await res.text()).trim();
}
