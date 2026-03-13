import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { supabase } from "@/lib/supabase";
import { uploadJSONToPinata, fetchFromIPFS } from "@/lib/pinata";

/**
 * API Route: Generate Formal Legal Arbitration Report
 * POST /api/dispute/legal-report
 *
 * Collects ALL evidence (messages, voice transcripts, meet transcript, IPFS files),
 * feeds into Nugen Legal AI (via Fastrouter) to generate a formal legal report,
 * stores result in Supabase + IPFS.
 */
export async function POST(request: NextRequest) {
    try {
        const {
            disputeId,
            messages = [],           // { sender, text, timestamp }[]
            voiceTranscripts = [],   // string[]
            meetTranscript = "",     // string
        } = await request.json();

        if (!disputeId) {
            return NextResponse.json({ error: "disputeId is required" }, { status: 400 });
        }

        // ── 1. Check cache ─────────────────────────────────────────
        const { data: existing } = await supabase
            .from("legal_reports")
            .select("*")
            .eq("dispute_id", disputeId)
            .maybeSingle();

        if (existing) {
            return NextResponse.json({ success: true, report: existing, cached: true });
        }

        // ── 2. Fetch dispute + job from Supabase ───────────────────
        const { data: dispute, error: dErr } = await supabase
            .from("disputes")
            .select("*, jobs(*), evidence(*)")
            .eq("id", disputeId)
            .single();

        if (dErr || !dispute) {
            return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
        }

        const job = (dispute as Record<string, unknown>).jobs as Record<string, unknown> | null;
        const evidenceRows = ((dispute as Record<string, unknown>).evidence as Array<{ ipfs_hash: string }>) ?? [];

        // ── 3. Fetch IPFS evidence content ─────────────────────────
        const ipfsEvidenceTexts: string[] = [];
        for (const ev of evidenceRows.slice(0, 5)) {
            try {
                const content = await fetchFromIPFS<unknown>(ev.ipfs_hash);
                ipfsEvidenceTexts.push(
                    typeof content === "string"
                        ? content
                        : JSON.stringify(content, null, 2)
                );
            } catch {
                ipfsEvidenceTexts.push(`[Evidence at ${ev.ipfs_hash} — could not fetch]`);
            }
        }

        // Fetch deliverable content from IPFS if available
        let deliverableText = "Not submitted";
        if (job && job.deliverable_ipfs) {
            try {
                const content = await fetchFromIPFS<unknown>(job.deliverable_ipfs as string);
                deliverableText = typeof content === "string" ? content : JSON.stringify(content);
            } catch {
                deliverableText = `IPFS: ${job.deliverable_ipfs}`;
            }
        }

        // ── 4. Build chat transcript string ────────────────────────
        const chatTranscript = messages.length > 0
            ? messages
                .map((m: { sender: string; text: string; timestamp?: string }) =>
                    `[${m.timestamp ?? ""}] ${m.sender}: ${m.text}`
                )
                .join("\n")
            : "No chat messages available.";

        const voiceTranscriptText = voiceTranscripts.length > 0
            ? voiceTranscripts
                .map((t: string, i: number) => `Voice Recording ${i + 1}:\n${t}`)
                .join("\n\n")
            : "No voice recordings available.";

        const meetTranscriptText = meetTranscript || "No meeting recording available.";

        // ── 5. Load and fill prompt template ───────────────────────
        const promptPath = join(process.cwd(), "prompts", "legal-report.txt");
        let promptTemplate = await readFile(promptPath, "utf-8");

        const reportDate = new Date().toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric",
        });

        const replacements: Record<string, string> = {
            "{{DISPUTE_ID}}":          (dispute.contract_dispute_id ?? disputeId).toString(),
            "{{REPORT_DATE}}":         reportDate,
            "{{JOB_TITLE}}":           (job?.title as string) ?? "Untitled Job",
            "{{CLIENT_ADDRESS}}":      (dispute.raised_by === job?.client
                                          ? dispute.raised_by
                                          : (job?.client as string)) ?? "Unknown",
            "{{FREELANCER_ADDRESS}}":  (job?.freelancer as string) ?? "Unknown",
            "{{AMOUNT}}":              job?.amount ? String(Number(job.amount) / 1_000_000) : "Unknown",
            "{{CONTRACT_ADDRESS}}":    process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS ?? "See contract",
            "{{JOB_DESCRIPTION}}":     (job?.description as string) ?? "Not provided",
            "{{DELIVERABLE}}":         deliverableText,
            "{{DISPUTE_REASON}}":      dispute.reason ?? "Not provided",
            "{{CHAT_TRANSCRIPT}}":     chatTranscript,
            "{{VOICE_TRANSCRIPTS}}":   voiceTranscriptText,
            "{{MEET_TRANSCRIPT}}":     meetTranscriptText,
            "{{IPFS_EVIDENCE}}":       ipfsEvidenceTexts.join("\n\n---\n\n") || "None submitted",
            "{{MSG_COUNT}}":           messages.length.toString(),
            "{{VOICE_COUNT}}":         voiceTranscripts.length.toString(),
            "{{MEET_COUNT}}":          meetTranscript ? "1" : "0",
            "{{IPFS_EVIDENCE_COUNT}}": evidenceRows.length.toString(),
        };

        for (const [key, value] of Object.entries(replacements)) {
            promptTemplate = promptTemplate.replaceAll(key, value);
        }

        // ── 6. Call Nugen Legal AI via Fastrouter (with GPT-4o fallback) ─
        const FASTROUTER_API_KEY = process.env.FASTROUTER_API_KEY;
        const OPENAI_API_KEY     = process.env.OPENAI_API_KEY;

        let rawResult: string | null = null;

        if (FASTROUTER_API_KEY) {
            try {
                rawResult = await callFastrouter(promptTemplate, FASTROUTER_API_KEY);
            } catch (e) {
                console.warn("Fastrouter failed, falling back to OpenAI:", e);
            }
        }

        if (!rawResult && OPENAI_API_KEY) {
            rawResult = await callOpenAI(promptTemplate, OPENAI_API_KEY);
        }

        if (!rawResult) {
            throw new Error("All AI providers failed — check API keys");
        }

        // ── 7. Parse AI response ───────────────────────────────────
        const analysisResult = JSON.parse(rawResult);

        if (!analysisResult.report_text || !analysisResult.recommendation) {
            throw new Error("AI response missing required fields");
        }

        // ── 8. Upload report to IPFS ───────────────────────────────
        const reportIpfsCid = await uploadJSONToPinata(
            {
                dispute_id:   disputeId,
                generated_at: new Date().toISOString(),
                ...analysisResult,
            },
            `legal-report-${disputeId}`
        );

        // ── 9. Save to Supabase ────────────────────────────────────
        const evidenceSummary = {
            messages_count:   messages.length,
            voice_count:      voiceTranscripts.length,
            meet_transcript:  !!meetTranscript,
            ipfs_files_count: evidenceRows.length,
        };

        const { data: saved, error: saveErr } = await supabase
            .from("legal_reports")
            .insert({
                dispute_id:       disputeId,
                report_text:      analysisResult.report_text,
                report_ipfs:      reportIpfsCid,
                evidence_summary: evidenceSummary,
                recommendation:   analysisResult.recommendation,
                confidence:       analysisResult.confidence ?? 0,
            })
            .select()
            .single();

        if (saveErr) throw saveErr;

        return NextResponse.json({
            success:        true,
            report:         saved,
            key_findings:   analysisResult.key_findings  ?? [],
            evidence_weight: analysisResult.evidence_weight ?? {},
            case_summary:   analysisResult.case_summary  ?? "",
            ipfsCid:        reportIpfsCid,
        });

    } catch (error) {
        console.error("Legal report generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate legal report", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// ── GET: check if report exists ───────────────────────────────
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const disputeId = searchParams.get("disputeId");
    if (!disputeId) {
        return NextResponse.json({ error: "disputeId required" }, { status: 400 });
    }

    const { data } = await supabase
        .from("legal_reports")
        .select("*")
        .eq("dispute_id", disputeId)
        .maybeSingle();

    return NextResponse.json({ report: data ?? null });
}

// ── Helpers ───────────────────────────────────────────────────

async function callFastrouter(prompt: string, apiKey: string): Promise<string> {
    const res = await fetch("https://api.fastrouter.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "nugen-legal",
            messages: [
                { role: "system", content: "You are a legal arbitration AI. Return ONLY valid JSON." },
                { role: "user",   content: prompt },
            ],
            temperature: 0.2,
            response_format: { type: "json_object" },
        }),
    });

    if (!res.ok) throw new Error(`Fastrouter ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.choices[0].message.content;
}

async function callOpenAI(prompt: string, apiKey: string): Promise<string> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a senior legal arbitration expert. Analyze the dispute evidence carefully and generate a formal arbitration report. Return ONLY valid JSON with no markdown.",
                },
                { role: "user", content: prompt },
            ],
            temperature: 0.2,
            response_format: { type: "json_object" },
        }),
    });

    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.choices[0].message.content;
}
