"use client";

import { useState, useRef } from "react";
import {
    Upload,
    FileText,
    Link2,
    Globe,
    Github,
    StickyNote,
    Loader2,
    X,
    CheckCircle2,
    AlertTriangle,
    File,
    Image,
    FileCode,
    FileArchive,
    Paperclip,
    Percent,
} from "lucide-react";

type UploadedFile = {
    name: string;
    ipfsHash: string;
    type: string;
    size: number;
};

type Props = {
    jobId: string;
    jobTitle: string;
    freelancerAddress: string;
    onSubmitSuccess: (deliverableIpfs: string) => void;
    isPending: boolean;
};

export default function ProjectSubmissionForm({
    jobId,
    jobTitle,
    freelancerAddress,
    onSubmitSuccess,
    isPending,
}: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [demoUrl, setDemoUrl] = useState("");
    const [repoUrl, setRepoUrl] = useState("");
    const [notes, setNotes] = useState("");
    const [completionPct, setCompletionPct] = useState(100);

    // File uploads
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
    const [mainDeliverable, setMainDeliverable] = useState<UploadedFile | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const mainFileRef = useRef<HTMLInputElement>(null);

    const getFileIcon = (type: string) => {
        if (type.startsWith("image/")) return <Image className="w-4 h-4 text-pink-400" />;
        if (type.includes("zip") || type.includes("tar") || type.includes("rar")) return <FileArchive className="w-4 h-4 text-amber-400" />;
        if (type.includes("pdf") || type.includes("document")) return <FileText className="w-4 h-4 text-blue-400" />;
        if (type.includes("javascript") || type.includes("typescript") || type.includes("json") || type.includes("html") || type.includes("css")) return <FileCode className="w-4 h-4 text-emerald-400" />;
        return <File className="w-4 h-4 text-white/50" />;
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes}B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    };

    const uploadFile = async (file: File): Promise<UploadedFile | null> => {
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await fetch("/api/ipfs/upload", { method: "POST", body: formData });
            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();
            return {
                name: file.name,
                ipfsHash: data.ipfsHash,
                type: file.type,
                size: file.size,
            };
        } catch (err) {
            console.error("File upload error:", err);
            return null;
        }
    };

    const handleMainFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingFiles((prev) => [...prev, file.name]);
        const uploaded = await uploadFile(file);
        setUploadingFiles((prev) => prev.filter((f) => f !== file.name));
        if (uploaded) setMainDeliverable(uploaded);
    };

    const handleAdditionalFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList) return;
        const newFiles = Array.from(fileList);

        for (const file of newFiles) {
            setUploadingFiles((prev) => [...prev, file.name]);
            const uploaded = await uploadFile(file);
            setUploadingFiles((prev) => prev.filter((f) => f !== file.name));
            if (uploaded) setFiles((prev) => [...prev, uploaded]);
        }
        // Reset the input
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeFile = (idx: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) {
            setSubmitError("Title and description are required.");
            return;
        }
        if (!mainDeliverable) {
            setSubmitError("Please upload the main deliverable file.");
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Save to DB
            const res = await fetch("/api/submissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jobId,
                    freelancer: freelancerAddress,
                    title: title.trim(),
                    description: description.trim(),
                    deliverableIpfs: mainDeliverable.ipfsHash,
                    files: [mainDeliverable, ...files],
                    demoUrl: demoUrl.trim() || null,
                    repoUrl: repoUrl.trim() || null,
                    notes: notes.trim() || null,
                    completionPct,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Submission save failed");
            }

            setSubmitSuccess(true);

            // Trigger on-chain submission via the parent
            onSubmitSuccess(mainDeliverable.ipfsHash);
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : "Submission failed");
            setIsSubmitting(false);
        }
    };

    if (submitSuccess) {
        return (
            <div className="space-y-4 p-6 rounded-2xl border border-[#1DBF73]/30 bg-[#1DBF73]/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1DBF73]/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-[#1DBF73]" />
                    </div>
                    <div>
                        <p className="text-[15px] font-bold text-[#1DBF73]">Submission Uploaded</p>
                        <p className="text-[12px] text-white/50">Waiting for on-chain confirmation…</p>
                    </div>
                </div>
                {isPending && (
                    <div className="flex items-center gap-2 text-[13px] text-amber-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Confirming on blockchain…
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-5 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-9 h-9 rounded-xl bg-[#1DBF73]/15 flex items-center justify-center">
                    <Upload className="w-4.5 h-4.5 text-[#1DBF73]" />
                </div>
                <div>
                    <p className="text-[14px] font-bold text-white">Submit Project</p>
                    <p className="text-[11px] text-white/40">Upload your deliverables for &ldquo;{jobTitle}&rdquo;</p>
                </div>
            </div>

            {/* Title */}
            <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/50 mb-1.5 block">
                    Submission Title <span className="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Final Smart Contract v2.0"
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:border-[#1DBF73]/50 focus:ring-1 focus:ring-[#1DBF73]/20 transition-all"
                />
            </div>

            {/* Description */}
            <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/50 mb-1.5 block">
                    Work Description <span className="text-red-400">*</span>
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what was built, key features, how to test, and any important notes…"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:border-[#1DBF73]/50 focus:ring-1 focus:ring-[#1DBF73]/20 transition-all resize-none"
                />
            </div>

            {/* Main Deliverable Upload */}
            <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/50 mb-1.5 block">
                    Main Deliverable <span className="text-red-400">*</span>
                </label>
                {mainDeliverable ? (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#1DBF73]/30 bg-[#1DBF73]/5">
                        {getFileIcon(mainDeliverable.type)}
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-white truncate">{mainDeliverable.name}</p>
                            <p className="text-[11px] text-white/40">{formatSize(mainDeliverable.size)} • IPFS</p>
                        </div>
                        <button onClick={() => setMainDeliverable(null)} className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => mainFileRef.current?.click()}
                        disabled={uploadingFiles.length > 0}
                        className="w-full flex flex-col items-center gap-2 py-6 rounded-xl border-2 border-dashed border-white/15 hover:border-[#1DBF73]/40 bg-white/[0.02] hover:bg-[#1DBF73]/5 transition-all group"
                    >
                        {uploadingFiles.some((f) => f === "main") ? (
                            <Loader2 className="w-6 h-6 text-[#1DBF73] animate-spin" />
                        ) : (
                            <Upload className="w-6 h-6 text-white/30 group-hover:text-[#1DBF73] transition-colors" />
                        )}
                        <span className="text-[13px] font-medium text-white/40 group-hover:text-white/60">Click to upload main deliverable</span>
                        <span className="text-[11px] text-white/25">ZIP, PDF, or any file • Uploaded to IPFS</span>
                    </button>
                )}
                <input ref={mainFileRef} type="file" className="hidden" onChange={handleMainFileChange} />
            </div>

            {/* Additional Files */}
            <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/50 mb-1.5 flex items-center gap-2">
                    <Paperclip className="w-3 h-3" /> Additional Files
                </label>
                <div className="space-y-2">
                    {files.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-white/10 bg-white/[0.03]">
                            {getFileIcon(file.type)}
                            <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-medium text-white truncate">{file.name}</p>
                                <p className="text-[10px] text-white/30">{formatSize(file.size)}</p>
                            </div>
                            <button onClick={() => removeFile(idx)} className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-red-400 transition-colors">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                    {uploadingFiles.filter((f) => f !== "main").map((name) => (
                        <div key={name} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-white/10 bg-white/[0.03]">
                            <Loader2 className="w-4 h-4 text-[#1DBF73] animate-spin" />
                            <p className="text-[12px] text-white/50">{name}</p>
                        </div>
                    ))}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-white/40 hover:text-white/60 hover:bg-white/5 transition-colors"
                    >
                        <Paperclip className="w-3.5 h-3.5" /> Add more files
                    </button>
                </div>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleAdditionalFiles} />
            </div>

            {/* URLs Row */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-white/50 mb-1.5 flex items-center gap-1.5">
                        <Globe className="w-3 h-3" /> Demo URL
                    </label>
                    <input
                        type="url"
                        value={demoUrl}
                        onChange={(e) => setDemoUrl(e.target.value)}
                        placeholder="https://demo.example.com"
                        className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#1DBF73]/50 transition-all"
                    />
                </div>
                <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-white/50 mb-1.5 flex items-center gap-1.5">
                        <Github className="w-3 h-3" /> Repository URL
                    </label>
                    <input
                        type="url"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="https://github.com/..."
                        className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#1DBF73]/50 transition-all"
                    />
                </div>
            </div>

            {/* Completion Percentage */}
            <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/50 mb-1.5 flex items-center gap-1.5">
                    <Percent className="w-3 h-3" /> Completion
                </label>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={completionPct}
                        onChange={(e) => setCompletionPct(Number(e.target.value))}
                        className="flex-1 h-2 rounded-full appearance-none bg-white/10 accent-[#1DBF73] cursor-pointer"
                    />
                    <span className={`text-[15px] font-bold tabular-nums w-12 text-right ${
                        completionPct === 100 ? "text-[#1DBF73]" : completionPct >= 75 ? "text-emerald-400" : completionPct >= 50 ? "text-amber-400" : "text-red-400"
                    }`}>
                        {completionPct}%
                    </span>
                </div>
            </div>

            {/* Notes */}
            <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/50 mb-1.5 flex items-center gap-1.5">
                    <StickyNote className="w-3 h-3" /> Additional Notes
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special instructions: test credentials, known issues, etc."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#1DBF73]/50 transition-all resize-none"
                />
            </div>

            {/* Error */}
            {submitError && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-[13px] text-red-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {submitError}
                </div>
            )}

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={isSubmitting || isPending || !title.trim() || !description.trim() || !mainDeliverable}
                className="w-full h-14 rounded-xl font-black uppercase tracking-wider bg-[#1DBF73] hover:bg-[#158a53] text-black shadow-[0_0_20px_rgba(29,191,115,0.4)] hover:shadow-[0_0_30px_rgba(29,191,115,0.6)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 text-[14px]"
            >
                {isSubmitting || isPending ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</>
                ) : (
                    <><Upload className="w-5 h-5" /> Submit Final Work</>
                )}
            </button>
        </div>
    );
}
