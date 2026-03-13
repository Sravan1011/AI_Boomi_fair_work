import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { supabase } from "@/lib/supabase";
import { uploadFileToPinata } from "@/lib/pinata";

const JAAS_API_BASE = "https://api.8x8.vc/jaas/v1";

/** Generate a management JWT for the JaaS REST API (same private key, room: "*") */
function generateManagementToken(): string {
    const appId      = process.env.NEXT_PUBLIC_JAAS_APP_ID!;
    const keyId      = process.env.JAAS_API_KEY_ID!;
    const privateKey = process.env.JAAS_PRIVATE_KEY!.replace(/\\n/g, "\n");
    const now = Math.floor(Date.now() / 1000);
    return jwt.sign(
        {
            iss: "chat", aud: "jitsi", iat: now, exp: now + 3600, nbf: now - 10,
            sub: appId, room: "*",
            context: { user: { moderator: true, name: "FairWork Server", id: "server" }, features: { recording: true } },
        },
        privateKey,
        { algorithm: "RS256", keyid: keyId }
    );
}

/**
 * API Route: JaaS Recording Management
 *
 * GET  /api/meet/recordings?roomName=... — list recordings for a room
 * POST /api/meet/recordings              — fetch latest recording, upload to IPFS, transcribe, store in DB
 */

// ── GET: list recordings from JaaS API ───────────────────────
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const roomName = searchParams.get("roomName");

    if (!roomName) {
        return NextResponse.json({ error: "roomName is required" }, { status: 400 });
    }

    const appId = process.env.NEXT_PUBLIC_JAAS_APP_ID;

    if (!appId || !process.env.JAAS_API_KEY_ID || !process.env.JAAS_PRIVATE_KEY) {
        return NextResponse.json({ error: "JaaS API credentials not configured" }, { status: 503 });
    }

    try {
        const apiToken = generateManagementToken();
        const response = await fetch(
            `${JAAS_API_BASE}/conferences/${appId}/${roomName}/recordings`,
            {
                headers: { Authorization: `Bearer ${apiToken}` },
            }
        );

        if (!response.ok) {
            throw new Error(`JaaS API error: ${response.status} ${await response.text()}`);
        }

        const data = await response.json();
        return NextResponse.json({ recordings: data.recordings ?? data });

    } catch (error) {
        console.error("Failed to fetch JaaS recordings:", error);
        return NextResponse.json(
            { error: "Failed to fetch recordings", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// ── POST: save transcript collected live from Jitsi → IPFS → DB ──────
export async function POST(request: NextRequest) {
    try {
        const { jobId, roomName, recordedBy, transcript = "" } = await request.json();

        if (!jobId || !roomName || !recordedBy) {
            return NextResponse.json({ error: "jobId, roomName, recordedBy are required" }, { status: 400 });
        }

        // Upload transcript text to IPFS as a JSON document
        const ipfsCid = transcript
            ? await uploadFileToPinata(
                new File(
                    [JSON.stringify({ roomName, transcript, savedAt: new Date().toISOString() })],
                    `transcript-${roomName}-${Date.now()}.json`,
                    { type: "application/json" }
                )
              )
            : null;

        // Save to Supabase
        const { data: saved, error: dbError } = await supabase
            .from("meet_recordings")
            .insert({
                job_id:      jobId,
                room_name:   roomName,
                ipfs_cid:    ipfsCid,
                transcript:  transcript || null,
                recorded_by: recordedBy,
            })
            .select()
            .single();

        if (dbError) throw dbError;

        return NextResponse.json({
            success:    true,
            recording:  saved,
            ipfsCid,
            transcript,
        });

    } catch (error) {
        console.error("Recording upload error:", error);
        return NextResponse.json(
            { error: "Failed to process recording", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
