import { NextRequest, NextResponse } from "next/server";


/**
 * API Route: Upload file to IPFS via Pinata
 * POST /api/ipfs/upload
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        const PINATA_JWT = process.env.PINATA_JWT;

        if (!PINATA_JWT) {
            return NextResponse.json(
                { error: "Pinata JWT not configured" },
                { status: 500 }
            );
        }

        // Create form data for Pinata
        const pinataFormData = new FormData();
        pinataFormData.append("file", file);

        const metadata = JSON.stringify({
            name: file.name,
        });
        pinataFormData.append("pinataMetadata", metadata);

        const options = JSON.stringify({
            cidVersion: 1,
        });
        pinataFormData.append("pinataOptions", options);

        // Upload to Pinata
        const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${PINATA_JWT}`,
            },
            body: pinataFormData,
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Pinata upload failed: ${error}`);
        }

        const data = await response.json();

        return NextResponse.json({
            success: true,
            ipfsHash: data.IpfsHash,
            url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
        });

    } catch (error) {
        console.error("IPFS upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload to IPFS" },
            { status: 500 }
        );
    }
}
