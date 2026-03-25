import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

/**
 * API Route: AI Dispute Analysis
 * POST /api/ai/analyze
 * 
 * Uses Fastrouter to route between Nugen and OpenAI
 * Returns structured JSON analysis of dispute
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { jobDescription, deliverable, clientEvidence, freelancerEvidence } = body;

        if (!jobDescription || !deliverable || !clientEvidence || !freelancerEvidence) {
            return NextResponse.json(
                { error: "jobDescription, deliverable, clientEvidence, and freelancerEvidence are required" },
                { status: 400 }
            );
        }

        // Load the dispute analysis prompt
        const promptPath = join(process.cwd(), "prompts", "dispute-analysis.txt");
        const promptTemplate = await readFile(promptPath, "utf-8");

        // Construct the full prompt with case data
        const fullPrompt = `${promptTemplate}

## DISPUTE DATA

### Job Description
${jobDescription}

### Deliverable Submitted
${deliverable}

### Client Evidence
${clientEvidence}

### Freelancer Evidence
${freelancerEvidence}

Now analyze this dispute and return ONLY valid JSON (no markdown, no code blocks).`;

        // Try Fastrouter first (routes between Nugen and OpenAI)
        const FASTROUTER_API_KEY = process.env.FASTROUTER_API_KEY;
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

        let analysisResult;

        // Attempt 1: Fastrouter (if configured)
        if (FASTROUTER_API_KEY) {
            try {
                console.log("Attempting analysis via Fastrouter...");
                analysisResult = await analyzeViaFastrouter(fullPrompt, FASTROUTER_API_KEY);
            } catch (error) {
                console.warn("Fastrouter failed, falling back to OpenAI:", error);
            }
        }

        // Attempt 2: Direct OpenAI fallback
        if (!analysisResult && OPENAI_API_KEY) {
            console.log("Using OpenAI fallback...");
            analysisResult = await analyzeViaOpenAI(fullPrompt, OPENAI_API_KEY);
        }

        if (!analysisResult) {
            throw new Error("All AI providers failed");
        }

        // Parse and validate the JSON response
        const analysis = JSON.parse(analysisResult);

        // Validate required fields
        if (!analysis.recommendation || !analysis.confidence || !analysis.summary || !analysis.reasoning) {
            throw new Error("Invalid AI response format");
        }

        return NextResponse.json({
            success: true,
            analysis,
        });

    } catch (error) {
        console.error("AI analysis error:", error);
        return NextResponse.json(
            {
                error: "Failed to analyze dispute",
                ...(process.env.NODE_ENV !== "production" && {
                    details: error instanceof Error ? error.message : "Unknown error",
                }),
            },
            { status: 500 }
        );
    }
}

/**
 * Analyze via Fastrouter (routes to Nugen or OpenAI)
 */
async function analyzeViaFastrouter(prompt: string, apiKey: string): Promise<string> {
    // ⚠️ FLAGGING: I need to verify the exact Fastrouter API endpoint structure
    // This is a placeholder based on common API patterns
    // You'll need to check Fastrouter docs for the actual endpoint

    const response = await fetch("https://api.fastrouter.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "nugen-legal", // ⚠️ VERIFY: Check actual model name for Nugen
            messages: [
                {
                    role: "system",
                    content: "You are a legal dispute analysis AI. Return ONLY valid JSON.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.3,
            response_format: { type: "json_object" },
        }),
    });

    if (!response.ok) {
        throw new Error(`Fastrouter API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

/**
 * Analyze via OpenAI (fallback)
 */
async function analyzeViaOpenAI(prompt: string, apiKey: string): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a legal dispute analysis AI. Return ONLY valid JSON with no markdown formatting.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.3,
            response_format: { type: "json_object" },
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}
