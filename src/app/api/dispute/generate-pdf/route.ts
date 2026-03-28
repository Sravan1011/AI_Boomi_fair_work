import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { supabase } from "@/lib/supabase";
import { formatUSDC, formatAddress } from "@/lib/utils";

/**
 * GET /api/dispute/generate-pdf?disputeId=xxx
 *
 * Generates and returns a comprehensive dispute PDF on-the-fly.
 * Includes: project details, contract terms, job description,
 * freelancer submission details, and dispute reason.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const disputeId = searchParams.get("disputeId");

    if (!disputeId) {
        return NextResponse.json({ error: "disputeId is required" }, { status: 400 });
    }

    try {
        // 1. Fetch dispute
        const { data: dispute, error: dErr } = await supabase
            .from("disputes")
            .select("*")
            .eq("id", disputeId)
            .single();
        if (dErr || !dispute) {
            return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
        }

        // 2. Fetch job
        const { data: job, error: jErr } = await supabase
            .from("jobs")
            .select("*")
            .eq("id", dispute.job_id)
            .single();
        if (jErr || !job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        // 3. Fetch freelancer submission (if any)
        const { data: submissions } = await supabase
            .from("project_submissions")
            .select("*")
            .eq("job_id", job.id)
            .order("created_at", { ascending: false })
            .limit(1);
        const submission = submissions?.[0] || null;

        // 4. Build PDF
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const contentWidth = pageWidth - margin * 2;
        let y = 20;

        const checkPage = (needed: number) => {
            if (y + needed > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage();
                y = 20;
            }
        };

        // ── HEADER ───────────────────────────────────────────────
        doc.setFillColor(29, 191, 115); // FairWork green
        doc.rect(0, 0, pageWidth, 40, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("FAIRWORK DISPUTE REPORT", margin, 18);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Report ID: FW-DSP-${disputeId.slice(0, 8).toUpperCase()}`, margin, 26);
        doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, margin, 32);
        doc.text("Classification: Dispute Arbitration Document", margin, 38);

        y = 50;
        doc.setTextColor(0, 0, 0);

        // ── HELPER: Section header ──
        const sectionHeader = (title: string) => {
            checkPage(14);
            doc.setFillColor(240, 240, 240);
            doc.rect(margin, y - 4, contentWidth, 10, "F");
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(29, 191, 115);
            doc.text(title, margin + 3, y + 3);
            y += 12;
            doc.setTextColor(50, 50, 50);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
        };

        const addField = (label: string, value: string) => {
            checkPage(10);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(120, 120, 120);
            doc.text(label, margin + 3, y);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(30, 30, 30);
            const lines = doc.splitTextToSize(value || "N/A", contentWidth - 6);
            doc.text(lines, margin + 3, y + 5);
            y += 5 + lines.length * 5 + 3;
        };

        const addMultiline = (text: string) => {
            const lines = doc.splitTextToSize(text || "N/A", contentWidth - 6);
            checkPage(lines.length * 5 + 4);
            doc.setFontSize(10);
            doc.setTextColor(50, 50, 50);
            doc.text(lines, margin + 3, y);
            y += lines.length * 5 + 4;
        };

        // ── 1. PROJECT OVERVIEW ──────────────────────────────────
        sectionHeader("1. PROJECT OVERVIEW");
        addField("Project Title", job.title);
        addField("Contract ID", `#${job.contract_job_id}`);
        addField("Escrow Amount", `$${formatUSDC(BigInt(job.amount))} USDC`);
        addField("Deadline", new Date(job.deadline * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));
        addField("Project Status", job.status);

        // ── 2. PARTIES INVOLVED ──────────────────────────────────
        sectionHeader("2. PARTIES INVOLVED");
        addField("Client Wallet", formatAddress(job.client));
        addField("Client Full Address", job.client);
        addField("Freelancer Wallet", job.freelancer ? formatAddress(job.freelancer) : "Not assigned");
        if (job.freelancer) addField("Freelancer Full Address", job.freelancer);

        // ── 3. CLIENT REQUIREMENTS (JOB DESCRIPTION) ────────────
        sectionHeader("3. CLIENT REQUIREMENTS");
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        checkPage(6);
        doc.text("The following is the original job description as posted by the client:", margin + 3, y);
        y += 7;
        doc.setFont("helvetica", "normal");
        addMultiline(job.description);

        if (job.description_ipfs) {
            addField("Job Brief (IPFS Reference)", job.description_ipfs);
        }

        // ── 4. FREELANCER SUBMISSION ─────────────────────────────
        sectionHeader("4. FREELANCER SUBMISSION");
        if (submission) {
            addField("Submission Title", submission.title);
            addField("Submission Description", submission.description);
            addField("Completion", `${submission.completion_pct}%`);

            if (submission.demo_url) addField("Demo URL", submission.demo_url);
            if (submission.repo_url) addField("Repository URL", submission.repo_url);

            if (submission.files && Array.isArray(submission.files) && submission.files.length > 0) {
                addField("Uploaded Files", submission.files.map((f: { name: string; ipfsHash: string; size: number }) =>
                    `• ${f.name} (IPFS: ${f.ipfsHash?.slice(0, 16)}…)`
                ).join("\n"));
            }

            if (submission.deliverable_ipfs) {
                addField("Main Deliverable (IPFS)", submission.deliverable_ipfs);
            }

            if (submission.notes) {
                addField("Additional Notes", submission.notes);
            }
        } else {
            addMultiline("No formal project submission was recorded via the submission form.");
            if (job.deliverable_ipfs) {
                addField("Deliverable File (IPFS)", job.deliverable_ipfs);
            }
        }

        // ── 5. DISPUTE DETAILS ───────────────────────────────────
        sectionHeader("5. DISPUTE DETAILS");
        addField("Dispute Raised By", formatAddress(dispute.raised_by));
        addField("Raised By Full Address", dispute.raised_by);
        addField("Dispute Reason", dispute.reason);
        addField("Date Raised", new Date(dispute.created_at).toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
        }));
        addField("Current Status", dispute.status);

        // ── 6. CONTRACT TERMS ────────────────────────────────────
        sectionHeader("6. SMART CONTRACT & ESCROW TERMS");
        addMultiline(
            `This dispute pertains to smart contract job #${job.contract_job_id} on the FairWork Escrow platform (Polygon chain). ` +
            `The total escrow amount of $${formatUSDC(BigInt(job.amount))} USDC is held in the FairWork Escrow smart contract until resolution. ` +
            `Funds will be released or refunded based on the arbitration outcome as determined by the DAO jury system.`
        );

        // ── FOOTER ───────────────────────────────────────────────
        checkPage(25);
        y += 5;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
        doc.setFontSize(8);
        doc.setTextColor(140, 140, 140);
        doc.setFont("helvetica", "italic");
        const footerLines = doc.splitTextToSize(
            "This document was auto-generated by the FairWork platform for dispute arbitration purposes. " +
            "All data is sourced from on-chain records, the FairWork database, and IPFS-stored documents. " +
            "This report should be reviewed by all parties before proceeding with the arbitration process.",
            contentWidth
        );
        doc.text(footerLines, margin, y);
        y += footerLines.length * 4 + 5;
        doc.setFont("helvetica", "bold");
        doc.text("FairWork — Decentralized Fair Freelancing", margin, y);

        // ── Return as PDF binary ─────────────────────────────────
        const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="FairWork-Dispute-${disputeId.slice(0, 8)}.pdf"`,
                "Cache-Control": "no-cache",
            },
        });
    } catch (error) {
        console.error("PDF generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate dispute PDF", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
