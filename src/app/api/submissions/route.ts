import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * API Route: Project Submissions
 *
 * POST /api/submissions        — Create a new project submission
 * GET  /api/submissions?jobId= — Fetch submissions for a job
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            jobId,
            freelancer,
            title,
            description,
            deliverableIpfs,
            files,
            demoUrl,
            repoUrl,
            notes,
            completionPct,
        } = body;

        if (!jobId || !freelancer || !title || !description) {
            return NextResponse.json(
                { error: "jobId, freelancer, title, and description are required." },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("project_submissions")
            .insert({
                job_id: jobId,
                freelancer: freelancer.toLowerCase(),
                title,
                description,
                deliverable_ipfs: deliverableIpfs || null,
                files: files || [],
                demo_url: demoUrl || null,
                repo_url: repoUrl || null,
                notes: notes || null,
                completion_pct: completionPct ?? 100,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, submission: data });
    } catch (error) {
        console.error("Failed to create submission:", error);
        return NextResponse.json(
            {
                error: "Failed to create submission",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
        return NextResponse.json(
            { error: "jobId query parameter is required." },
            { status: 400 }
        );
    }

    try {
        const { data, error } = await supabase
            .from("project_submissions")
            .select("*")
            .eq("job_id", jobId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, submissions: data || [] });
    } catch (error) {
        console.error("Failed to fetch submissions:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch submissions",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
