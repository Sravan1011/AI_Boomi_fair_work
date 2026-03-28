import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/dispute/respond
 *
 * Records a client or freelancer's agree/disagree response on a dispute.
 * Body: { disputeId, wallet, response: 'AGREE' | 'DISAGREE' }
 */
export async function POST(request: NextRequest) {
    try {
        const { disputeId, wallet, response } = await request.json();

        if (!disputeId || !wallet || !response) {
            return NextResponse.json(
                { error: "disputeId, wallet, and response are required." },
                { status: 400 }
            );
        }

        if (!["AGREE", "DISAGREE"].includes(response)) {
            return NextResponse.json(
                { error: "response must be 'AGREE' or 'DISAGREE'." },
                { status: 400 }
            );
        }

        // Fetch dispute + job to determine if wallet is client or freelancer
        const { data: dispute, error: dErr } = await supabase
            .from("disputes")
            .select("*, jobs(client, freelancer)")
            .eq("id", disputeId)
            .single();

        if (dErr || !dispute) {
            return NextResponse.json({ error: "Dispute not found." }, { status: 404 });
        }

        const job = dispute.jobs as { client: string; freelancer: string } | null;
        if (!job) {
            return NextResponse.json({ error: "Associated job not found." }, { status: 404 });
        }

        const lowerWallet = wallet.toLowerCase();
        const isClient = lowerWallet === job.client.toLowerCase();
        const isFreelancer = lowerWallet === job.freelancer?.toLowerCase();

        if (!isClient && !isFreelancer) {
            return NextResponse.json(
                { error: "Only the client or freelancer can respond." },
                { status: 403 }
            );
        }

        // Update the appropriate column
        const updateField = isClient ? "client_response" : "freelancer_response";
        const { error: uErr } = await supabase
            .from("disputes")
            .update({ [updateField]: response })
            .eq("id", disputeId);

        if (uErr) throw uErr;

        return NextResponse.json({ success: true, role: isClient ? "client" : "freelancer", response });
    } catch (error) {
        console.error("Dispute respond error:", error);
        return NextResponse.json(
            { error: "Failed to record response", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
