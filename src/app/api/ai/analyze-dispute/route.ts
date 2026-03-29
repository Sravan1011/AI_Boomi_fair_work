import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Nugen environment variables
const NUGEN_API_KEY = process.env.NUGEN_API_KEY;
const FASTROUTER_API_KEY = process.env.FASTROUTER_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const maxDuration = 60;

const LEGAL_SYSTEM_PROMPT = `You are a decentralized Web3 Arbitrator AI, acting as an impartial legal tribunal for the FairWork platform.
You will be provided with the details of an escrow agreement, the contractor's deliverables, and the dispute claim.

Your job is to read through the evidence and assign an advisory verdict in the form of a JSON object. You must draft your response in the tone and structure of an official, internationally recognized Arbitration Award. Use standard legal vocabulary (e.g., 'Claimant', 'Respondent', 'Breach of Contract', 'Burden of Proof', 'Material Non-Performance', 'Fiduciary Duty'). Cite the original description as 'The Agreement'.

You must output ONLY valid JSON without any markdown formatting or surrounding text.

Required JSON Structure:
{
  "recommendation": "CLIENT" | "FREELANCER" | "NEUTRAL",
  "confidence": <integer between 0 and 100>,
  "summary": "<A formal 3-5 sentence Arbitration Summary utilizing standard legal jurisprudence. Objective overview of the factual disputes, the assessment of the claim, and the recommended legal judgment.>",
  "reasoning": [
    "<A formal finding addressing the burden of proof and specific contractual obligations established in The Agreement.>",
    "<A formal finding establishing whether a material breach of contract occurred based on standard commercial law.>",
    "<A formal evidentiary ruling evaluating the adequacy of the submitted deliverables against the original Escrow Terms.>"
  ]
}

DO NOT include backticks (\`\`\`) in your response. Just the raw JSON object. Never mention that the dispute is officially 'resolved'. You are simply providing a formal advisory perspective and legal recommendation.`;

export async function POST(request: NextRequest) {
    try {
        const { disputeId } = await request.json();
        if (!disputeId) {
            return NextResponse.json({ error: "Missing disputeId" }, { status: 400 });
        }

        // 1. Fetch Dispute details
        const { data: dispute, error: dErr } = await supabase
            .from("disputes")
            .select("*")
            .eq("id", disputeId)
            .single();

        if (dErr || !dispute) {
            return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
        }

        // Check if an analysis already exists
        const { data: existingAnalysis } = await supabase
            .from("ai_analysis")
            .select("id")
            .eq("dispute_id", disputeId)
            .single();

        if (existingAnalysis) {
            return NextResponse.json({ success: true, message: "Analysis already exists" });
        }

        // 2. Fetch Job details
        const { data: job, error: jErr } = await supabase
            .from("jobs")
            .select("*")
            .eq("id", dispute.job_id)
            .single();

        if (jErr || !job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        // 3. Fetch Freelancer Subs
        const { data: submissions } = await supabase
            .from("project_submissions")
            .select("*")
            .eq("job_id", job.id)
            .order("created_at", { ascending: false })
            .limit(1);

        const submission = submissions?.[0] || null;

        // 4. Construct the prompt
        let userPrompt = `
### PROJECT DETAILS
- Project Title: ${job.title}
- Client Wallet: ${job.client}
- Freelancer Wallet: ${job.freelancer}
- Escrow Amount: ${job.amount / 1000000} USDC

### CONTRACT (CLIENT REQUIREMENTS)
${job.description || "No description provided."}

### FREELANCER SUBMISSION
${submission ? `
- Title: ${submission.title || 'Nothing is mentioned'}
- Description: ${submission.description || 'Nothing is mentioned'}
- Demo URL: ${submission.demo_url || 'Nothing is mentioned'}
- Repo URL: ${submission.repo_url || 'Nothing is mentioned'}
- Notes: ${submission.notes || 'Nothing is mentioned'}
- Self-reported Completion: ${submission.completion_pct ? submission.completion_pct + '%' : 'Nothing is mentioned'}
` : "Nothing is mentioned. The freelancer has not submitted any deliverable data."}

### DISPUTE CLAIM
- Raised By Wallet: ${dispute.raised_by}
- Reason stated: ${dispute.reason}

Based strictly on the original contract requirements and what the freelancer submitted, evaluate who is at fault and provide your perspective. Who failed their obligations?
`;

        // 5. Call AI
        let aiResultString: string | null = null;
        let attemptPath = "None";

        // Attempt 1: Fastrouter
        if (FASTROUTER_API_KEY) {
            try {
                attemptPath = "Fastrouter (Nugen)";
                aiResultString = await callChatCompletion(
                    "https://api.fastrouter.ai/v1/chat/completions",
                    "nugen-flash-v1",
                    FASTROUTER_API_KEY,
                    userPrompt
                );
            } catch (e) {
                console.warn("Fastrouter failed:", e);
            }
        }

        // Attempt 2: Nugen Direct
        if (!aiResultString && NUGEN_API_KEY) {
            try {
                attemptPath = "Nugen Direct API";
                aiResultString = await callChatCompletion(
                    "https://api.nugen.in/inference/completions",
                    "nugen-flash-v1",
                    NUGEN_API_KEY,
                    userPrompt
                );
            } catch (e) {
                console.warn("Nugen Direct API failed:", e);
            }
        }

        // Attempt 3: OpenAI Fallback
        if (!aiResultString && OPENAI_API_KEY) {
            try {
                attemptPath = "OpenAI Fallback";
                aiResultString = await callChatCompletion(
                    "https://api.openai.com/v1/chat/completions",
                    "gpt-4o-mini", // Use mini for faster fallback
                    OPENAI_API_KEY,
                    userPrompt,
                    true // Supports forced JSON
                );
            } catch (e) {
                console.warn("OpenAI fallback failed:", e);
            }
        }

        if (!aiResultString) {
            throw new Error(`All AI paths failed. (Last attempted: ${attemptPath})`);
        }

        // Clean JSON formatting if AI returned markdown
        aiResultString = aiResultString.trim().replace(/^```json/i, "").replace(/^```/i, "").replace(/```$/i, "").trim();

        // Parse result
        let parsedResult;
        try {
            parsedResult = JSON.parse(aiResultString);
        } catch (e) {
            console.error("Failed to parse AI output as JSON:", aiResultString);
            throw new Error("AI returned invalid JSON format.");
        }

        // 6. Save back to Supabase
        const { error: insertErr } = await supabase.from("ai_analysis").insert({
            dispute_id: disputeId,
            recommendation: parsedResult.recommendation || "NEUTRAL",
            confidence: parsedResult.confidence || 50,
            summary: parsedResult.summary || "Unable to determine.",
            reasoning: parsedResult.reasoning || ["The AI could not confidently reason about this conflict."],
        });

        if (insertErr) {
            throw insertErr;
        }

        return NextResponse.json({ success: true, message: "AI Analysis Complete" });

    } catch (error) {
        console.error("Dispute AI Error:", error);
        return NextResponse.json(
            { error: "Failed to generate AI analysis", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

async function callChatCompletion(
    url: string,
    model: string,
    apiKey: string,
    userPrompt: string,
    jsonMode: boolean = false
): Promise<string> {
    const payload: any = {
        model,
        messages: [
            { role: "system", content: LEGAL_SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
        ],
        temperature: 0.2, // Lower temp for logical output
        max_tokens: 1500,
    };

    if (jsonMode) {
        payload.response_format = { type: "json_object" };
    }

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}
