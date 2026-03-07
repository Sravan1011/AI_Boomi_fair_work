"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Bell, Briefcase, CheckCircle, AlertCircle, Clock, X } from "lucide-react";
import gsap from "gsap";

type Notification = {
    id: string;
    type: string;
    title: string;
    message: string;
    job_id: string | null;
    is_read: boolean;
    created_at: string;
};

const typeIcons: Record<string, typeof Bell> = {
    job_accepted: Briefcase,
    work_submitted: CheckCircle,
    job_approved: CheckCircle,
    dispute_raised: AlertCircle,
    dispute_resolved: CheckCircle,
};

export default function NotificationBell() {
    const { address, isConnected } = useAccount();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    useEffect(() => {
        if (!address) return;
        // Fetch notifications
        supabase
            .from("notifications")
            .select("*")
            .eq("wallet", address.toLowerCase())
            .order("created_at", { ascending: false })
            .limit(20)
            .then(({ data }) => setNotifications((data as Notification[]) || []));
    }, [address]);

    useEffect(() => {
        if (!dropdownRef.current) return;
        if (open) {
            gsap.fromTo(dropdownRef.current,
                { opacity: 0, y: -8, scale: 0.97 },
                { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "power3.out" }
            );
        }
    }, [open]);

    const markAllRead = async () => {
        const unread = notifications.filter((n) => !n.is_read).map((n) => n.id);
        if (unread.length === 0) return;
        await supabase.from("notifications").update({ is_read: true }).in("id", unread);
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    };

    if (!isConnected) return null;

    return (
        <div style={{ position: "relative" }}>
            <button
                onClick={() => { setOpen((v) => !v); if (!open) markAllRead(); }}
                aria-label="Notifications"
                style={{
                    position: "relative",
                    width: 40, height: 40,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "none",
                    transition: "border-color 0.25s",
                    color: "var(--text-muted)",
                }}
            >
                <Bell className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                {unreadCount > 0 && (
                    <span style={{
                        position: "absolute",
                        top: -3, right: -3,
                        width: 16, height: 16,
                        borderRadius: "50%",
                        background: "var(--accent)",
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid var(--bg)",
                    }}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <>
                    {/* Backdrop */}
                    <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 998 }} />

                    <div ref={dropdownRef} style={{
                        position: "absolute",
                        top: "calc(100% + 12px)",
                        right: 0,
                        width: 380,
                        maxHeight: 480,
                        overflowY: "auto",
                        background: "var(--bg-3)",
                        border: "1px solid var(--border)",
                        borderRadius: 18,
                        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
                        zIndex: 999,
                    }}>
                        {/* Header */}
                        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontWeight: 700, color: "var(--text)", fontSize: "0.95rem" }}>Notifications</span>
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                {unreadCount > 0 && (
                                    <button onClick={markAllRead} style={{ fontSize: "0.75rem", color: "var(--accent-light)", background: "none", border: "none", cursor: "none", fontFamily: "inherit" }}>
                                        Mark all read
                                    </button>
                                )}
                                <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "none", color: "var(--text-muted)" }}>
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {notifications.length === 0 ? (
                            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.88rem" }}>
                                <Bell className="w-8 h-8 mx-auto mb-3 opacity-30" style={{ margin: "0 auto 12px" }} />
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((n) => {
                                const Icon = typeIcons[n.type] || Bell;
                                return (
                                    <Link
                                        key={n.id}
                                        href={n.job_id ? `/jobs/${n.job_id}` : "/dashboard"}
                                        onClick={() => setOpen(false)}
                                        style={{
                                            display: "flex",
                                            gap: 14,
                                            padding: "14px 20px",
                                            borderBottom: "1px solid var(--border)",
                                            background: n.is_read ? "transparent" : "rgba(107,93,211,0.05)",
                                            textDecoration: "none",
                                            transition: "background 0.2s",
                                        }}
                                    >
                                        <div style={{
                                            width: 36, height: 36,
                                            borderRadius: 10,
                                            background: "var(--accent-dim)",
                                            border: "1px solid rgba(107,93,211,0.2)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}>
                                            <Icon className="w-4 h-4" style={{ color: "var(--accent-light)", width: 16, height: 16 }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 700, color: "var(--text)", fontSize: "0.85rem", marginBottom: 3 }}>{n.title}</div>
                                            <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", lineHeight: 1.5 }}>{n.message}</div>
                                            <div style={{ color: "var(--text-subtle)", fontSize: "0.72rem", marginTop: 5 }}>
                                                <Clock className="inline w-3 h-3 mr-1" />
                                                {new Date(n.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        {!n.is_read && (
                                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", flexShrink: 0, marginTop: 6 }} />
                                        )}
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
