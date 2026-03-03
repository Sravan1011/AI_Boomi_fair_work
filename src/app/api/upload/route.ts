import { NextRequest, NextResponse } from "next/server";

const PINATA_JWT = process.env.PINATA_JWT;

/**
 * Upload JSON data to IPFS via Pinata
 * This is a server-side API route to keep the JWT secret
 */
export async function POST(request: NextRequest) {
    try {
        if (!PINATA_JWT) {
            throw new Error("Missing PINATA_JWT environment variable");
        }

        const body = await request.json();
        const { jsonData, name } = body;

        if (!jsonData || !name) {
            return NextResponse.json(
                { error: "Missing jsonData or name" },
                { status: 400 }
            );
        }

        const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${PINATA_JWT}`,
            },
            body: JSON.stringify({
                pinataContent: jsonData,
                pinataMetadata: {
                    name,
                },
                pinataOptions: {
                    cidVersion: 1,
                },
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Pinata JSON upload failed: ${error}`);
        }

        const data = await response.json();
        return NextResponse.json({ ipfsHash: data.IpfsHash });
    } catch (error: unknown) {
        console.error("API upload error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Upload failed" },
            { status: 500 }
        );
    }
}
