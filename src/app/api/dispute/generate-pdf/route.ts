import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { supabase } from "@/lib/supabase";
import { formatUSDC, formatAddress } from "@/lib/utils";

/**
 * GET /api/dispute/generate-pdf?disputeId=xxx
 *
 * Generates a formal legal arbitration document in PDF format.
 * Styled as an official court/arbitration tribunal document.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const disputeId = searchParams.get("disputeId");

    if (!disputeId) {
        return NextResponse.json({ error: "disputeId is required" }, { status: 400 });
    }

    try {
        // ── 1. Fetch dispute
        const { data: dispute, error: dErr } = await supabase
            .from("disputes")
            .select("*")
            .eq("id", disputeId)
            .single();
        if (dErr || !dispute) {
            return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
        }

        // ── 2. Fetch job
        const { data: job, error: jErr } = await supabase
            .from("jobs")
            .select("*")
            .eq("id", dispute.job_id)
            .single();
        if (jErr || !job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        // ── 3. Fetch AI analysis (if any)
        const { data: aiAnalysis } = await supabase
            .from("ai_analysis")
            .select("*")
            .eq("dispute_id", disputeId)
            .maybeSingle();

        // ── 4. Fetch freelancer submission (if any)
        const { data: submissions } = await supabase
            .from("project_submissions")
            .select("*")
            .eq("job_id", job.id)
            .order("created_at", { ascending: false })
            .limit(1);
        const submission = submissions?.[0] || null;

        // ── 5. Build the PDF ─────────────────────────────────────────
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const PW = doc.internal.pageSize.getWidth();   // 210
        const PH = doc.internal.pageSize.getHeight();  // 297
        const ML = 25;   // left margin
        const MR = 25;   // right margin
        const CW = PW - ML - MR;  // content width
        let y = 0;

        // ── Colour palette (dark navy + gold) ─────────────────────
        const NAVY   = [15, 30, 68]  as [number, number, number];
        const GOLD   = [180, 140, 60] as [number, number, number];
        const DGRAY  = [50, 50, 60]  as [number, number, number];
        const LGRAY  = [235, 235, 240] as [number, number, number];
        const MGRAY  = [160, 160, 170] as [number, number, number];
        const WHITE  = [255, 255, 255] as [number, number, number];
        const BLACK  = [10, 10, 20]  as [number, number, number];

        // ── Page helpers ───────────────────────────────────────────
        const newPage = () => {
            doc.addPage();
            y = 20;
            // Subtle top border on continuation pages
            doc.setDrawColor(...NAVY);
            doc.setLineWidth(0.5);
            doc.line(ML, 10, PW - MR, 10);
            doc.setFontSize(7);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(...MGRAY);
            doc.text(
                `FairWork Arbitration Tribunal · Case No. FW-ARB-${disputeId.slice(0, 8).toUpperCase()} · CONFIDENTIAL`,
                PW / 2, 8, { align: "center" }
            );
        };

        const checkPage = (needed: number) => {
            if (y + needed > PH - 28) newPage();
        };

        // ════════════════════════════════════════════════════════════
        // PAGE 1 — COVER / HEADER
        // ════════════════════════════════════════════════════════════

        // Dark navy header band
        doc.setFillColor(...NAVY);
        doc.rect(0, 0, PW, 55, "F");

        // Gold top accent strip
        doc.setFillColor(...GOLD);
        doc.rect(0, 0, PW, 3, "F");

        // Left seal/logo placeholder
        doc.setFillColor(...GOLD);
        doc.circle(ML + 10, 28, 10, "F");
        doc.setFillColor(...NAVY);
        doc.circle(ML + 10, 28, 8, "F");
        doc.setTextColor(...GOLD);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("FW", ML + 10, 30, { align: "center" });

        // Title block (right of seal)
        doc.setTextColor(...WHITE);
        doc.setFontSize(15);
        doc.setFont("helvetica", "bold");
        doc.text("FAIRWORK ARBITRATION TRIBUNAL", ML + 25, 18);

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(200, 210, 230);
        doc.text("Decentralized Freelance Dispute Resolution · Blockchain-Verified · Polygon Network", ML + 25, 24);

        doc.setTextColor(...GOLD);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("FORMAL ARBITRATION AWARD & DISPUTE RECORD", ML + 25, 32);

        // Right-aligned case meta
        doc.setTextColor(200, 210, 230);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        const caseNo    = `FW-ARB-${disputeId.slice(0, 8).toUpperCase()}`;
        const reportDate = new Date().toLocaleDateString("en-GB", {
            day: "2-digit", month: "long", year: "numeric",
        });
        doc.text(`Case No.: ${caseNo}`,     PW - MR, 18, { align: "right" });
        doc.text(`Date Issued: ${reportDate}`, PW - MR, 24, { align: "right" });
        doc.text("Classification: CONFIDENTIAL", PW - MR, 30, { align: "right" });
        doc.text(`Status: ${dispute.status}`,   PW - MR, 36, { align: "right" });

        y = 62;

        // ── Sub-heading: Case Caption block (legal case style) ─────
        doc.setFillColor(...LGRAY);
        doc.roundedRect(ML, y, CW, 32, 2, 2, "F");
        doc.setDrawColor(...NAVY);
        doc.setLineWidth(0.3);
        doc.roundedRect(ML, y, CW, 32, 2, 2, "S");

        // Vertical divider
        doc.setDrawColor(...NAVY);
        doc.line(PW / 2, y + 4, PW / 2, y + 28);

        // Claimant side
        doc.setTextColor(...MGRAY);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text("CLAIMANT (RAISED BY)", ML + 5, y + 8);
        doc.setTextColor(...NAVY);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.text(formatAddress(dispute.raised_by), ML + 5, y + 15);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...DGRAY);
        const claimantRole = dispute.raised_by.toLowerCase() === job.client?.toLowerCase() ? "Role: Client" : "Role: Freelancer";
        doc.text(claimantRole, ML + 5, y + 21);
        doc.setFontSize(6.5);
        doc.setTextColor(...MGRAY);
        const claimantAddr = doc.splitTextToSize(dispute.raised_by, CW / 2 - 12);
        doc.text(claimantAddr, ML + 5, y + 27);

        // Respondent side
        const respondentAddr = dispute.raised_by.toLowerCase() === job.client?.toLowerCase()
            ? (job.freelancer || "Not Assigned")
            : job.client;
        const respondentRole = dispute.raised_by.toLowerCase() === job.client?.toLowerCase()
            ? "Role: Freelancer (Respondent)"
            : "Role: Client (Respondent)";

        doc.setTextColor(...MGRAY);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text("RESPONDENT", PW / 2 + 5, y + 8);
        doc.setTextColor(...NAVY);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.text(formatAddress(respondentAddr), PW / 2 + 5, y + 15);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...DGRAY);
        doc.text(respondentRole, PW / 2 + 5, y + 21);
        doc.setFontSize(6.5);
        doc.setTextColor(...MGRAY);
        const respLines = doc.splitTextToSize(respondentAddr, CW / 2 - 12);
        doc.text(respLines, PW / 2 + 5, y + 27);

        y += 38;

        // "In the matter of" subtitle
        doc.setTextColor(...NAVY);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bolditalic");
        doc.text(`In the Matter of Contract Dispute — "${job.title}"`, ML, y);
        y += 5;
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(...MGRAY);
        doc.text(
            `Escrow Smart Contract #${job.contract_job_id} · ${process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS ?? "See blockchain"} · Polygon Network`,
            ML, y
        );
        y += 10;

        // Gold horizontal rule
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(0.8);
        doc.line(ML, y, PW - MR, y);
        y += 8;

        // ════════════════════════════════════════════════════════════
        // SECTION HELPERS
        // ════════════════════════════════════════════════════════════

        const sectionHeader = (number: string, title: string) => {
            checkPage(18);
            // Full-width navy band
            doc.setFillColor(...NAVY);
            doc.rect(ML, y - 2, CW, 10, "F");
            // Gold left tab
            doc.setFillColor(...GOLD);
            doc.rect(ML, y - 2, 4, 10, "F");

            doc.setTextColor(...WHITE);
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.text(`ARTICLE ${number}  —  ${title.toUpperCase()}`, ML + 7, y + 5);
            y += 14;
        };

        const subHeader = (title: string) => {
            checkPage(10);
            doc.setFillColor(...LGRAY);
            doc.rect(ML, y, CW, 7, "F");
            doc.setTextColor(...NAVY);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.text(title, ML + 3, y + 5);
            y += 10;
        };

        // Two-column key→value row
        const fieldRow = (label: string, value: string, italic = false) => {
            const valLines = doc.splitTextToSize(value || "N/A", CW - 52);
            const rowH = Math.max(6, valLines.length * 4.5 + 2);
            checkPage(rowH + 2);

            doc.setFillColor(248, 248, 252);
            doc.rect(ML, y, CW, rowH, "F");
            doc.setDrawColor(220, 220, 228);
            doc.setLineWidth(0.1);
            doc.rect(ML, y, CW, rowH, "S");

            doc.setFontSize(7.5);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...MGRAY);
            doc.text(label.toUpperCase(), ML + 3, y + rowH / 2 + 1.5, { baseline: "middle" });

            doc.setFontSize(8.5);
            doc.setFont("helvetica", italic ? "italic" : "normal");
            doc.setTextColor(...BLACK);
            doc.text(valLines, ML + 52, y + (rowH - valLines.length * 4.5) / 2 + 4);
            y += rowH + 1.5;
        };

        // Paragraph body text
        const bodyText = (text: string, indent = 0) => {
            const lines = doc.splitTextToSize(text || "N/A", CW - indent);
            checkPage(lines.length * 4.8 + 4);
            doc.setFontSize(8.5);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...DGRAY);
            doc.text(lines, ML + indent, y);
            y += lines.length * 4.8 + 4;
        };

        // Numbered finding
        let findingIndex = 0;
        const finding = (text: string) => {
            findingIndex++;
            const lines = doc.splitTextToSize(text, CW - 10);
            checkPage(lines.length * 4.8 + 5);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...NAVY);
            doc.text(`${findingIndex}.`, ML + 2, y);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...DGRAY);
            doc.text(lines, ML + 10, y);
            y += lines.length * 4.8 + 3;
        };

        // ════════════════════════════════════════════════════════════
        // PREAMBLE
        // ════════════════════════════════════════════════════════════
        doc.setTextColor(...DGRAY);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        const preamble = doc.splitTextToSize(
            `This Arbitration Award and Dispute Record has been prepared by the FairWork Decentralized Arbitration Tribunal ` +
            `pursuant to the FairWork Platform Terms of Service and the Smart Escrow Agreement governing the above-captioned matter. ` +
            `This document constitutes a formal record of the dispute proceedings and the advisory recommendation of the Tribunal. ` +
            `All wallet addresses referenced herein serve as the binding legal identifiers of the respective parties on the Polygon blockchain network.`,
            CW
        );
        doc.text(preamble, ML, y);
        y += preamble.length * 4.8 + 8;

        // ════════════════════════════════════════════════════════════
        // ARTICLE I — PARTIES & JURISDICTION
        // ════════════════════════════════════════════════════════════
        sectionHeader("I", "Parties & Jurisdiction");

        fieldRow("Case Number",        `FW-ARB-${disputeId.slice(0, 8).toUpperCase()}`);
        fieldRow("Date of Filing",     new Date(dispute.created_at).toLocaleDateString("en-GB", {
            day: "2-digit", month: "long", year: "numeric",
        }));
        fieldRow("Tribunal",           "FairWork Decentralized Arbitration Tribunal");
        fieldRow("Governing Network",  "Polygon (MATIC) · EVM-Compatible Blockchain");
        fieldRow("Escrow Contract",    process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS || "See on-chain records");

        y += 3;
        subHeader("1.1  Claimant (Initiating Party)");
        fieldRow("Display Address",    formatAddress(dispute.raised_by));
        fieldRow("Full Wallet Address", dispute.raised_by);
        fieldRow("Role in Agreement",  claimantRole.replace("Role: ", ""));

        y += 3;
        subHeader("1.2  Respondent");
        fieldRow("Display Address",    formatAddress(respondentAddr));
        fieldRow("Full Wallet Address", respondentAddr);
        fieldRow("Role in Agreement",  respondentRole.replace("Role: ", "").replace(" (Respondent)", ""));

        y += 5;

        // ════════════════════════════════════════════════════════════
        // ARTICLE II — CONTRACT DETAILS
        // ════════════════════════════════════════════════════════════
        sectionHeader("II", "Contract & Escrow Details");

        fieldRow("Job / Project Title",   job.title);
        fieldRow("Contract Job ID",       `#${job.contract_job_id}`);
        fieldRow("Escrow Amount",         `USD $${formatUSDC(BigInt(job.amount))} USDC`);
        fieldRow("Contract Deadline",     new Date(job.deadline * 1000).toLocaleDateString("en-GB", {
            day: "2-digit", month: "long", year: "numeric",
        }));
        fieldRow("Contract Status",       job.status);
        fieldRow("Client Party",          formatAddress(job.client));
        fieldRow("Freelancer Party",      job.freelancer ? formatAddress(job.freelancer) : "Not assigned");
        if (job.description_ipfs) {
            fieldRow("Brief Document (IPFS)", job.description_ipfs);
        }

        y += 5;

        // ════════════════════════════════════════════════════════════
        // ARTICLE III — STATEMENT OF FACTS & CONTRACT TERMS
        // ════════════════════════════════════════════════════════════
        sectionHeader("III", "Statement of Facts & Original Contract Terms");

        doc.setTextColor(...NAVY);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bolditalic");
        checkPage(8);
        doc.text("The following constitutes the original service agreement (\"The Agreement\") as posted by the Client:", ML, y);
        y += 7;

        // Quoted block
        doc.setFillColor(245, 245, 252);
        doc.setDrawColor(...NAVY);
        doc.setLineWidth(0.3);
        const descLines = doc.splitTextToSize(job.description || "No description provided.", CW - 14);
        const descH = descLines.length * 4.8 + 8;
        checkPage(descH + 4);
        doc.rect(ML, y - 2, CW, descH, "F");
        doc.rect(ML, y - 2, 3, descH, "F");
        doc.setFillColor(...NAVY);
        doc.rect(ML, y - 2, 3, descH, "F");
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(40, 40, 80);
        doc.text(descLines, ML + 8, y + 2);
        y += descH + 6;

        // ════════════════════════════════════════════════════════════
        // ARTICLE IV — FREELANCER SUBMISSION / DELIVERABLES
        // ════════════════════════════════════════════════════════════
        sectionHeader("IV", "Freelancer Deliverables & Work Submission");

        if (submission) {
            fieldRow("Submission Title",       submission.title);
            fieldRow("Work Description",       submission.description);
            fieldRow("Completion Percentage",  `${submission.completion_pct ?? 0}%`);
            if (submission.demo_url)          fieldRow("Live Demo URL",         submission.demo_url);
            if (submission.repo_url)          fieldRow("Source Repository URL", submission.repo_url);
            if (submission.deliverable_ipfs)  fieldRow("Deliverable IPFS Hash", submission.deliverable_ipfs);
            if (submission.notes)             fieldRow("Freelancer Notes",       submission.notes);

            if (submission.files && Array.isArray(submission.files) && submission.files.length > 0) {
                fieldRow("Uploaded Files", submission.files
                    .map((f: { name: string; ipfsHash?: string }) =>
                        `• ${f.name}${f.ipfsHash ? ` (IPFS: ${f.ipfsHash.slice(0, 20)}…)` : ""}`
                    ).join("\n"));
            }
        } else {
            checkPage(10);
            doc.setFillColor(255, 248, 230);
            doc.setDrawColor(200, 160, 60);
            doc.setLineWidth(0.3);
            const noSubLines = doc.splitTextToSize(
                "No formal project submission was recorded via the FairWork submission system. " +
                (job.deliverable_ipfs
                    ? `A deliverable was uploaded directly to IPFS: ${job.deliverable_ipfs}`
                    : "No deliverable IPFS hash is associated with this contract."),
                CW - 8
            );
            doc.rect(ML, y, CW, noSubLines.length * 4.8 + 8, "F");
            doc.rect(ML, y, CW, noSubLines.length * 4.8 + 8, "S");
            doc.setFontSize(8.5);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(120, 80, 20);
            doc.text(noSubLines, ML + 5, y + 6);
            y += noSubLines.length * 4.8 + 12;
        }

        y += 5;

        // ════════════════════════════════════════════════════════════
        // ARTICLE V — DISPUTE PARTICULARS
        // ════════════════════════════════════════════════════════════
        sectionHeader("V", "Dispute Particulars & Claimant Statement");

        fieldRow("Dispute Reference ID",     disputeId);
        fieldRow("Date of Dispute Filing",   new Date(dispute.created_at).toLocaleDateString("en-GB", {
            day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
        } as Intl.DateTimeFormatOptions));
        fieldRow("Dispute Status",           dispute.status);
        if (dispute.dispute_pdf_ipfs) {
            fieldRow("Evidence Document (IPFS)", dispute.dispute_pdf_ipfs);
        }

        y += 3;
        subHeader("5.1  Statement of Claim");
        // Quoted claim
        const reasonLines = doc.splitTextToSize(dispute.reason || "No reason provided.", CW - 14);
        const reasonH = reasonLines.length * 4.8 + 8;
        checkPage(reasonH + 4);
        doc.setFillColor(255, 242, 242);
        doc.setDrawColor(200, 80, 80);
        doc.setLineWidth(0.3);
        doc.rect(ML, y - 2, CW, reasonH, "F");
        doc.setFillColor(200, 80, 80);
        doc.rect(ML, y - 2, 3, reasonH, "F");
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100, 30, 30);
        doc.text(reasonLines, ML + 8, y + 2);
        y += reasonH + 8;

        // ════════════════════════════════════════════════════════════
        // ARTICLE VI — AI TRIBUNAL ANALYSIS (if available)
        // ════════════════════════════════════════════════════════════
        sectionHeader("VI", "AI Tribunal Analysis & Advisory Findings");

        if (aiAnalysis) {
            // Recommendation verdict box
            const recColor: [number, number, number] =
                aiAnalysis.recommendation === "CLIENT"     ? [200, 80,  80]  :
                aiAnalysis.recommendation === "FREELANCER" ? [29, 140, 85]   :
                                                             [100, 100, 180];
            const recLabel =
                aiAnalysis.recommendation === "CLIENT"     ? "AWARD IN FAVOUR OF CLIENT"     :
                aiAnalysis.recommendation === "FREELANCER" ? "AWARD IN FAVOUR OF FREELANCER" :
                                                             "NEUTRAL / INCONCLUSIVE";

            checkPage(22);
            doc.setFillColor(...recColor);
            doc.roundedRect(ML, y, CW, 18, 2, 2, "F");
            doc.setTextColor(...WHITE);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("ADVISORY VERDICT:", ML + 6, y + 8);
            doc.setFontSize(11);
            doc.text(recLabel, ML + 6, y + 15);
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text(`Tribunal Confidence: ${aiAnalysis.confidence}%`, PW - MR - 6, y + 10, { align: "right" });
            doc.text(`Analysis Date: ${new Date(aiAnalysis.analyzed_at).toLocaleDateString("en-GB")}`, PW - MR - 6, y + 15, { align: "right" });
            y += 24;

            subHeader("6.1  Executive Summary");
            bodyText(aiAnalysis.summary);

            if (aiAnalysis.reasoning && Array.isArray(aiAnalysis.reasoning) && aiAnalysis.reasoning.length > 0) {
                y += 2;
                subHeader("6.2  Findings of Fact & Legal Reasoning");
                findingIndex = 0;
                for (const reason of aiAnalysis.reasoning) {
                    finding(reason);
                }
            }
        } else {
            checkPage(20);
            doc.setFillColor(240, 244, 255);
            doc.setDrawColor(...NAVY);
            doc.setLineWidth(0.2);
            const pendLines = doc.splitTextToSize(
                "AI tribunal analysis has not yet been completed for this matter. " +
                "The Claimant or Respondent may initiate the AI analysis process from the Dispute Detail page. " +
                "The tribunal's advisory findings will be appended to this record upon completion.",
                CW - 8
            );
            doc.rect(ML, y, CW, pendLines.length * 4.8 + 10, "F");
            doc.rect(ML, y, CW, pendLines.length * 4.8 + 10, "S");
            doc.setFontSize(8.5);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(60, 60, 120);
            doc.text(pendLines, ML + 5, y + 7);
            y += pendLines.length * 4.8 + 14;
        }

        y += 5;

        // ════════════════════════════════════════════════════════════
        // ARTICLE VII — ESCROW & RESOLUTION MECHANISM
        // ════════════════════════════════════════════════════════════
        sectionHeader("VII", "Escrow Mechanism & Resolution Process");

        bodyText(
            `The total escrow amount of USD $${formatUSDC(BigInt(job.amount))} USDC is ` +
            `held in the FairWork Smart Escrow Contract (${process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS ?? "see blockchain"}) ` +
            `on the Polygon network. Funds are immutably locked pending resolution of this dispute.`
        );

        y += 2;
        subHeader("7.1  Resolution Procedure");
        findingIndex = 0;
        finding("AI Arbitration: The FairWork AI Tribunal conducts an impartial analysis of all submitted evidence, chat records, and contractual obligations.");
        finding("Jury Deliberation: A panel of randomly selected, staked DAO jurors reviews the AI findings and casts binding votes.");
        finding("Majority Decision: A simple majority of jury votes determines the final outcome. Ties are resolved by the AI advisory verdict.");
        finding("Automatic Enforcement: The smart contract automatically disburses funds to the prevailing party upon consensus, without possibility of human override.");
        finding("Final Award: This document records the proceedings and outcome for permanent, immutable reference on IPFS.");

        y += 5;

        // ════════════════════════════════════════════════════════════
        // ARTICLE VIII — STATUS & OUTCOME
        // ════════════════════════════════════════════════════════════
        sectionHeader("VIII", "Current Status & Outcome");

        fieldRow("Dispute Status",     dispute.status);
        fieldRow("Outcome",            dispute.outcome || "PENDING RESOLUTION");
        fieldRow("Resolution Date",    dispute.resolved_at
            ? new Date(dispute.resolved_at).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
            : "Not yet resolved"
        );

        if (dispute.client_response) {
            fieldRow("Client Response to Report",     dispute.client_response);
        }
        if (dispute.freelancer_response) {
            fieldRow("Freelancer Response to Report", dispute.freelancer_response);
        }

        y += 5;

        // ════════════════════════════════════════════════════════════
        // CERTIFICATION BLOCK
        // ════════════════════════════════════════════════════════════
        checkPage(60);

        doc.setDrawColor(...GOLD);
        doc.setLineWidth(0.8);
        doc.line(ML, y, PW - MR, y);
        y += 8;

        doc.setTextColor(...NAVY);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("CERTIFICATE OF AUTHENTICITY", PW / 2, y, { align: "center" });
        y += 7;

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...DGRAY);
        const certText = doc.splitTextToSize(
            `This document is a true, accurate, and complete record of the dispute proceedings in Case No. FW-ARB-${disputeId.slice(0, 8).toUpperCase()}, ` +
            `generated on ${reportDate} by the FairWork Automated Arbitration System. ` +
            `All data is sourced from immutable blockchain records, the FairWork platform database, and IPFS-stored documents. ` +
            `This record is cryptographically verifiable and has been stored on IPFS for permanent, tamper-proof archival.`,
            CW
        );
        doc.text(certText, ML, y);
        y += certText.length * 4.8 + 10;

        // Signature grid
        const sigBoxW = (CW - 10) / 3;
        const sigBoxH = 24;

        const sigBoxes = [
            { title: "FairWork Arbitration System", sub: "Automated Tribunal · Digital Seal" },
            { title: "Claimant Acknowledged",       sub: dispute.client_response ? `Response: ${dispute.client_response}` : "Pending Acknowledgment" },
            { title: "Respondent Acknowledged",     sub: dispute.freelancer_response ? `Response: ${dispute.freelancer_response}` : "Pending Acknowledgment" },
        ];

        sigBoxes.forEach((box, i) => {
            const bx = ML + i * (sigBoxW + 5);
            doc.setFillColor(...LGRAY);
            doc.setDrawColor(...NAVY);
            doc.setLineWidth(0.2);
            doc.roundedRect(bx, y, sigBoxW, sigBoxH, 1.5, 1.5, "F");
            doc.roundedRect(bx, y, sigBoxW, sigBoxH, 1.5, 1.5, "S");

            // Signature line
            doc.setDrawColor(...MGRAY);
            doc.setLineWidth(0.3);
            doc.line(bx + 5, y + sigBoxH - 9, bx + sigBoxW - 5, y + sigBoxH - 9);

            doc.setFontSize(7);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...NAVY);
            const titleLines = doc.splitTextToSize(box.title, sigBoxW - 8);
            doc.text(titleLines, bx + sigBoxW / 2, y + 7, { align: "center" });

            doc.setFontSize(6.5);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(...MGRAY);
            const subLines = doc.splitTextToSize(box.sub, sigBoxW - 8);
            doc.text(subLines, bx + sigBoxW / 2, y + sigBoxH - 5, { align: "center" });
        });

        y += sigBoxH + 8;

        // ════════════════════════════════════════════════════════════
        // FOOTER — all pages
        // ════════════════════════════════════════════════════════════
        const totalPages = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            // Bottom band
            doc.setFillColor(...NAVY);
            doc.rect(0, PH - 14, PW, 14, "F");
            doc.setFillColor(...GOLD);
            doc.rect(0, PH - 14, PW, 1.5, "F");

            doc.setTextColor(...WHITE);
            doc.setFontSize(6.5);
            doc.setFont("helvetica", "normal");
            doc.text(
                `FairWork Arbitration Tribunal  ·  Case: FW-ARB-${disputeId.slice(0, 8).toUpperCase()}  ·  CONFIDENTIAL  ·  Not Legal Advice`,
                PW / 2, PH - 8, { align: "center" }
            );
            doc.text(`Page ${i} of ${totalPages}`, PW - MR, PH - 4, { align: "right" });
            doc.setTextColor(180, 200, 220);
            doc.text(`Generated: ${reportDate}`, ML, PH - 4);
        }

        // ── Output ────────────────────────────────────────────────
        const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="FairWork-Arbitration-${disputeId.slice(0, 8)}.pdf"`,
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
