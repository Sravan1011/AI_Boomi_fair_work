import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: AI Chat Transcript
 * POST /api/ai/transcript
 *
 * Receives chat messages (text + voice), transcribes voice messages via
 * the existing /api/transcribe endpoint, then asks GPT-4o to produce a
 * structured project transcript.
 *
 * Body: { messages: Array<{ text, isAudio, audioUrl, isMine, sentAt }>,
 *         jobTitle?: string, jobAmount?: string }
 *
 * Returns: { success: true, transcript: { summary, decisions, actionItems,
 *            timeline, concerns, participants } }
 */

interface IncomingMessage {
    text: string;
    isAudio: boolean;
    audioUrl?: string;
    isMine: boolean;
    sentAt: number;
}

export async function POST(request: NextRequest) {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
        return NextResponse.json(
            { error: "OPENAI_API_KEY is not configured." },
            { status: 503 }
        );
    }

    try {
        const { messages, jobTitle, jobAmount } = (await request.json()) as {
            messages: IncomingMessage[];
            jobTitle?: string;
            jobAmount?: string;
        };

        if (!messages || messages.length === 0) {
            return NextResponse.json(
                { error: "No messages provided." },
                { status: 400 }
            );
        }

        // ── Step 1: Transcribe voice messages ──────────────────────
        const resolved: { role: string; text: string; time: string }[] = [];

        for (const msg of messages) {
            const role = msg.isMine ? "You" : "Counterparty";
            const time = new Date(msg.sentAt).toLocaleString();

            if (msg.isAudio && msg.audioUrl) {
                // Send base64 audio to existing /api/transcribe
                try {
                    const origin = request.nextUrl.origin;
                    const res = await fetch(`${origin}/api/transcribe`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            base64: msg.audioUrl,
                            mimeType: "audio/webm",
                        }),
                    });

                    if (res.ok) {
                        const { transcript } = await res.json();
                        resolved.push({
                            role,
                            text: `[Voice message]: ${transcript}`,
                            time,
                        });
                    } else {
                        resolved.push({
                            role,
                            text: "[Voice message — transcription failed]",
                            time,
                        });
                    }
                } catch {
                    resolved.push({
                        role,
                        text: "[Voice message — transcription failed]",
                        time,
                    });
                }
            } else {
                resolved.push({ role, text: msg.text, time });
            }
        }

        // ── Step 2: Build conversation log ─────────────────────────
        const conversationLog = resolved
            .map((m) => `[${m.time}] ${m.role}: ${m.text}`)
            .join("\n");

        // ── Step 3: Ask GPT-4o for structured transcript ───────────
        const systemPrompt = `You are a project analyst AI. You will receive a conversation log between a client and a freelancer on a job platform. Analyze the conversation and produce a structured project transcript.

Return ONLY valid JSON (no markdown, no code blocks) with the following structure:
{
  "summary": "A concise paragraph summarizing the project / conversation",
  "decisions": ["List of key decisions or agreements reached"],
  "actionItems": ["List of pending tasks or next steps mentioned"],
  "timeline": ["Notable dates, deadlines, or milestones mentioned"],
  "concerns": ["Any issues, risks, or disagreements raised"],
  "participants": { "client": "Brief description of client role/stance", "freelancer": "Brief description of freelancer role/stance" }
}

If no items exist for a category, return an empty array. Be concise and factual.`;

        const userPrompt = `## JOB CONTEXT
Title: ${jobTitle || "Unknown"}
Budget: ${jobAmount ? `${jobAmount} USDC` : "Not specified"}

## CONVERSATION LOG (${resolved.length} messages)
${conversationLog}

Analyze this conversation and return the structured project transcript JSON.`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                temperature: 0.3,
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`OpenAI API error: ${errText}`);
        }

        const data = await response.json();
        const transcript = JSON.parse(data.choices[0].message.content);

        return NextResponse.json({ success: true, transcript });
    } catch (error) {
        console.error("Transcript generation error:", error);
        return NextResponse.json(
            {
                error: "Failed to generate transcript",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
