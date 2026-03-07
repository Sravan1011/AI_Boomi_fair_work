"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";

interface ReviewModalProps {
    jobId: string;
    revieweeAddress: string;
    reviewerRole: "client" | "freelancer";
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => Promise<void>;
}

export default function ReviewModal({ reviewerRole, onClose, onSubmit }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) return;
        setSubmitting(true);
        await onSubmit(rating, comment);
        setDone(true);
    };

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
        }}>
            <div style={{
                background: "var(--bg-3)",
                border: "1px solid var(--border)",
                borderRadius: 24,
                padding: 40,
                width: 440,
                maxWidth: "90vw",
                position: "relative",
                boxShadow: "0 40px 120px rgba(0,0,0,0.8)",
            }}>
                <button onClick={onClose} style={{
                    position: "absolute",
                    top: 16, right: 16,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border)",
                    borderRadius: "50%",
                    width: 32, height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "none",
                    color: "var(--text-muted)",
                }}>
                    <X className="w-4 h-4" />
                </button>

                {done ? (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                        <div style={{ fontSize: "3rem", marginBottom: 16 }}>🎉</div>
                        <h3 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "1.4rem", color: "var(--text)", marginBottom: 8 }}>Review submitted!</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Your review has been posted to the freelancer&apos;s profile.</p>
                        <button onClick={onClose} className="btn-magnetic btn-primary-glow" style={{ marginTop: 24, display: "inline-flex", fontFamily: "inherit" }}>
                            Done
                        </button>
                    </div>
                ) : (
                    <>
                        <h3 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "1.4rem", color: "var(--text)", marginBottom: 6 }}>
                            Leave a Review
                        </h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 28 }}>
                            {reviewerRole === "client" ? "How was working with this freelancer?" : "How was this client to work with?"}
                        </p>

                        {/* Star selector */}
                        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <button
                                    key={i}
                                    onClick={() => setRating(i)}
                                    onMouseEnter={() => setHovered(i)}
                                    onMouseLeave={() => setHovered(0)}
                                    style={{ background: "none", border: "none", cursor: "none", padding: 2 }}
                                >
                                    <Star style={{
                                        width: 32, height: 32,
                                        fill: i <= (hovered || rating) ? "#fbbf24" : "transparent",
                                        color: i <= (hovered || rating) ? "#fbbf24" : "var(--text-subtle)",
                                        transition: "all 0.15s",
                                        transform: i <= (hovered || rating) ? "scale(1.15)" : "scale(1)",
                                    }} />
                                </button>
                            ))}
                        </div>
                        <p style={{ color: "var(--text-subtle)", fontSize: "0.78rem", marginBottom: 24, height: 16 }}>
                            {rating === 1 && "Poor"}{rating === 2 && "Fair"}{rating === 3 && "Good"}{rating === 4 && "Very Good"}{rating === 5 && "Excellent!"}
                        </p>

                        {/* Comment */}
                        <div style={{ marginBottom: 28 }}>
                            <label style={{ display: "block", fontWeight: 600, fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 8 }}>
                                Comment <span style={{ color: "var(--text-subtle)", fontWeight: 400 }}>(optional)</span>
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience working together…"
                                rows={4}
                                style={{ width: "100%", padding: "12px 14px", fontSize: "0.88rem", resize: "vertical" }}
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={rating === 0 || submitting}
                            className="btn-magnetic btn-primary-glow"
                            style={{ display: "flex", alignItems: "center", gap: 8, opacity: rating === 0 || submitting ? 0.5 : 1, fontFamily: "inherit", width: "100%", justifyContent: "center" }}
                        >
                            <Star className="w-4 h-4" />
                            {submitting ? "Submitting…" : "Submit Review"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
