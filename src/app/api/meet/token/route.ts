import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

/**
 * API Route: Generate JaaS JWT Token
 * POST /api/meet/token
 *
 * Generates a short-lived RS256-signed JWT for JaaS (Jitsi as a Service).
 * Required env vars:
 *   NEXT_PUBLIC_JAAS_APP_ID  — your app ID from jaas.8x8.vc
 *   JAAS_API_KEY_ID          — key ID (kid) from the dashboard
 *   JAAS_PRIVATE_KEY         — RSA private key in PEM format
 */
export async function POST(request: NextRequest) {
    try {
        const { roomName, displayName, isModerator = false } = await request.json();

        if (!roomName || !displayName) {
            return NextResponse.json(
                { error: "roomName and displayName are required" },
                { status: 400 }
            );
        }

        const appId      = process.env.NEXT_PUBLIC_JAAS_APP_ID;
        const keyId      = process.env.JAAS_API_KEY_ID;
        const privateKey = process.env.JAAS_PRIVATE_KEY;

        if (!appId || !keyId || !privateKey) {
            return NextResponse.json(
                { error: "JaaS credentials not configured. Set NEXT_PUBLIC_JAAS_APP_ID, JAAS_API_KEY_ID, JAAS_PRIVATE_KEY in .env.local" },
                { status: 503 }
            );
        }

        // JaaS requires the private key with proper newlines
        // When stored in .env.local, newlines are escaped as \n
        const formattedKey = privateKey.replace(/\\n/g, "\n");

        const now = Math.floor(Date.now() / 1000);

        const payload = {
            iss: "chat",
            iat: now,
            exp: now + 7200,         // 2-hour expiry
            nbf: now - 10,
            aud: "jitsi",
            sub: appId,
            room: roomName,
            context: {
                user: {
                    moderator: isModerator,
                    name: displayName,
                    id: displayName.replace(/\s/g, "_").toLowerCase(),
                    email: `${displayName.toLowerCase().replace(/\s/g, "")}@fairwork.app`,
                },
                features: {
                    recording:        false, // requires JaaS paid plan
                    livestreaming:    false,
                    transcription:    false, // requires JaaS paid plan
                    "outbound-call":  false,
                },
            },
        };

        const token = jwt.sign(payload, formattedKey, {
            algorithm: "RS256",
            keyid: keyId,
        });

        return NextResponse.json({ token });

    } catch (error) {
        console.error("JaaS token generation error:", error);
        return NextResponse.json(
            {
                error: "Failed to generate meeting token",
                ...(process.env.NODE_ENV !== "production" && {
                    details: error instanceof Error ? error.message : "Unknown error",
                }),
            },
            { status: 500 }
        );
    }
}
