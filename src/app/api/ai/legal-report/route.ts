import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Legal Document Report
 * POST /api/ai/legal-report
 *
 * Takes structured transcript data and generates a formal legal-format
 * project report. Tries Nugen (via Fastrouter) first, falls back to OpenAI.
 *
 * Body: { transcript, jobTitle, jobAmount, clientAddress, freelancerAddress }
 * Returns: { success: true, report: string (HTML) }
 */

interface TranscriptPayload {
    transcript: {
        summary: string;
        decisions: string[];
        actionItems: string[];
        timeline: string[];
        concerns: string[];
        participants?: { client?: string; freelancer?: string };
    };
    jobTitle?: string;
    jobAmount?: string;
    clientAddress?: string;
    freelancerAddress?: string;
}

const LEGAL_SYSTEM_PROMPT = `You are a professional legal document drafting AI for a Web3 freelancing platform called FairWork.

Generate a formal, professional legal-format project report in HTML. The document should look like a real legal report with proper structure, numbering, and formal language.

Use this EXACT HTML structure (no markdown, no code blocks — return ONLY raw HTML):

<div class="legal-doc">
  <div class="doc-header">
    <h1>PROJECT COMMUNICATION REPORT</h1>
    <p class="subtitle">FairWork — Decentralized Freelancing Platform</p>
    <p class="doc-meta">Document Reference: FW-[generate a reference number]</p>
    <p class="doc-meta">Date of Report: [current date]</p>
    <p class="doc-meta">Classification: Confidential — Project Communication Record</p>
  </div>

  <div class="doc-section">
    <h2>1. PARTIES INVOLVED</h2>
    <p>Details of client and freelancer with wallet addresses...</p>
  </div>

  <div class="doc-section">
    <h2>2. PROJECT OVERVIEW</h2>
    <p>Project title, scope, budget/compensation details...</p>
  </div>

  <div class="doc-section">
    <h2>3. COMMUNICATION SUMMARY</h2>
    <p>Comprehensive summary derived from the conversation analysis...</p>
  </div>

  <div class="doc-section">
    <h2>4. KEY AGREEMENTS & DECISIONS</h2>
    <p>Formally documented decisions from the transcript...</p>
  </div>

  <div class="doc-section">
    <h2>5. DELIVERABLES & ACTION ITEMS</h2>
    <p>Outstanding tasks and deliverables...</p>
  </div>

  <div class="doc-section">
    <h2>6. RISK ASSESSMENT</h2>
    <p>Identified risks and concerns...</p>
  </div>

  <div class="doc-section">
    <h2>7. TIMELINE & MILESTONES</h2>
    <p>Key dates and milestones...</p>
  </div>

  <div class="doc-section">
    <h2>8. CONCLUSIONS & RECOMMENDATIONS</h2>
    <p>Professional conclusions and recommended next steps...</p>
  </div>

  <div class="doc-footer">
    <p>This report was generated automatically by FairWork AI from encrypted on-chain communications (XMTP protocol). It serves as a record of project communications and should not be considered legal advice.</p>
    <p class="disclaimer">End-to-end encrypted • Blockchain-verified • AI-generated analysis</p>
  </div>
</div>

Use professional legal language. Be thorough, formal, and precise. Use numbered sub-points where appropriate. Return ONLY the HTML, no wrapping code blocks.`;

export async function POST(request: NextRequest) {
    const FASTROUTER_API_KEY = process.env.FASTROUTER_API_KEY;
    const NUGEN_API_KEY = process.env.NUGEN_API_KEY;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!FASTROUTER_API_KEY && !NUGEN_API_KEY && !OPENAI_API_KEY) {
        return NextResponse.json(
            { error: "No AI API key configured." },
            { status: 503 }
        );
    }

    try {
        const body = (await request.json()) as TranscriptPayload;
        const { transcript, jobTitle, jobAmount, clientAddress, freelancerAddress } = body;

        if (!transcript) {
            return NextResponse.json({ error: "No transcript data provided." }, { status: 400 });
        }

        // Build a comprehensive user prompt from the transcript
        const userPrompt = `Generate a formal legal project report from the following transcript analysis:

## PROJECT DETAILS
- **Title:** ${jobTitle || "Untitled Project"}
- **Budget:** ${jobAmount ? `${jobAmount} USDC` : "Not specified"}
- **Client Wallet:** ${clientAddress || "Not provided"}
- **Freelancer Wallet:** ${freelancerAddress || "Not provided"}
- **Date:** ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

## AI TRANSCRIPT ANALYSIS

### Project Summary
${transcript.summary || "No summary available."}

### Key Decisions
${transcript.decisions?.length ? transcript.decisions.map((d, i) => `${i + 1}. ${d}`).join("\n") : "No key decisions recorded."}

### Action Items
${transcript.actionItems?.length ? transcript.actionItems.map((a, i) => `${i + 1}. ${a}`).join("\n") : "No action items recorded."}

### Timeline / Milestones
${transcript.timeline?.length ? transcript.timeline.map((t, i) => `${i + 1}. ${t}`).join("\n") : "No timeline data recorded."}

### Concerns / Risks
${transcript.concerns?.length ? transcript.concerns.map((c, i) => `${i + 1}. ${c}`).join("\n") : "No concerns recorded."}

### Participant Roles
- Client: ${transcript.participants?.client || "Not specified"}
- Freelancer: ${transcript.participants?.freelancer || "Not specified"}

Generate the full HTML legal document report now.`;

        let report: string | null = null;

        // ── Attempt 1: Fastrouter → Nugen ─────────────────────────
        if (FASTROUTER_API_KEY) {
            try {
                console.log("Attempting legal report via Fastrouter (Nugen)...");
                report = await callChatCompletion(
                    "https://api.fastrouter.ai/v1/chat/completions",
                    "nugen-flash-v1",
                    FASTROUTER_API_KEY,
                    userPrompt
                );
            } catch (err) {
                console.warn("Fastrouter failed:", err);
            }
        }

        // ── Attempt 2: Direct Nugen API ───────────────────────────
        if (!report && NUGEN_API_KEY) {
            try {
                console.log("Attempting legal report via direct Nugen API...");
                report = await callChatCompletion(
                    "https://api.nugen.in/inference/completions",
                    "nugen-flash-v1",
                    NUGEN_API_KEY,
                    userPrompt
                );
            } catch (err) {
                console.warn("Nugen direct API failed:", err);
            }
        }

        // ── Attempt 3: OpenAI fallback ────────────────────────────
        if (!report && OPENAI_API_KEY) {
            console.log("Using OpenAI fallback for legal report...");
            report = await callChatCompletion(
                "https://api.openai.com/v1/chat/completions",
                "gpt-4o",
                OPENAI_API_KEY,
                userPrompt
            );
        }

        if (!report) {
            throw new Error("All AI providers failed to generate the report.");
        }

        return NextResponse.json({ success: true, report });
    } catch (error) {
        console.error("Legal report generation error:", error);
        return NextResponse.json(
            {
                error: "Failed to generate legal report",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}

async function callChatCompletion(
    url: string,
    model: string,
    apiKey: string,
    userPrompt: string
): Promise<string> {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: "system", content: LEGAL_SYSTEM_PROMPT },
                { role: "user", content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 4096,
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`${model} API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}
