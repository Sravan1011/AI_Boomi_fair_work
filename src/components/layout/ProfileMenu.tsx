"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { User, LayoutDashboard, Settings, LogOut, ChevronDown } from "lucide-react";

type Profile = {
    display_name: string | null;
    title: string | null;
    avatar_url: string | null;
};

export default function ProfileMenu() {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    // Fetch profile when connected
    useEffect(() => {
        if (!address) { setProfile(null); return; }
        supabase
            .from("profiles")
            .select("display_name, title, avatar_url")
            .eq("wallet", address.toLowerCase())
            .single()
            .then(({ data }) => setProfile(data));
    }, [address]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    if (!isConnected || !address) return null;

    // Avatar: image or gradient initial
    const initials = profile?.display_name
        ? profile.display_name[0].toUpperCase()
        : address.slice(2, 4).toUpperCase();

    const shortAddress = `${address.slice(0, 6)}…${address.slice(-4)}`;
    const displayName = profile?.display_name || shortAddress;

    const menuItems = [
        { icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard", href: "/dashboard" },
        { icon: <User className="w-4 h-4" />, label: "View Profile", href: `/profile/${address}` },
        { icon: <Settings className="w-4 h-4" />, label: "Edit Profile", href: "/profile/edit" },
    ];

    return (
        <div ref={ref} style={{ position: "relative" }}>
            {/* Avatar button */}
            <button
                onClick={() => setOpen((o) => !o)}
                style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "6px 12px 6px 6px",
                    borderRadius: 99,
                    border: "1.5px solid rgba(255,255,255,0.1)",
                    background: open ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.04)",
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "all 0.2s",
                }}
            >
                {/* Avatar circle */}
                {profile?.avatar_url ? (
                    <Image
                        src={profile.avatar_url}
                        width={30}
                        height={30}
                        alt={displayName}
                        style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover" }}
                    />
                ) : (
                    <div style={{
                        width: 30, height: 30, borderRadius: "50%",
                        background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.75rem", fontWeight: 700, color: "#fff", flexShrink: 0,
                    }}>
                        {initials}
                    </div>
                )}

                {/* Name */}
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f0f0f5", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {displayName}
                </span>

                <ChevronDown
                    className="w-3.5 h-3.5"
                    style={{ color: "#8888a0", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                />
            </button>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                    minWidth: 220,
                    background: "#0f0f1a",
                    border: "1.5px solid rgba(255,255,255,0.08)",
                    borderRadius: 14,
                    boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
                    zIndex: 100,
                    overflow: "hidden",
                }}>
                    {/* Profile header */}
                    <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f0f0f5", margin: 0 }}>{displayName}</p>
                        {profile?.title && (
                            <p style={{ fontSize: "0.75rem", color: "#8888a0", marginTop: 2 }}>{profile.title}</p>
                        )}
                        <p style={{ fontSize: "0.72rem", color: "#555", marginTop: 4, fontFamily: "monospace" }}>{shortAddress}</p>
                    </div>

                    {/* Menu items */}
                    <div style={{ padding: "8px 0" }}>
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    padding: "10px 16px",
                                    color: "#c0c0d0", fontSize: "0.85rem", fontWeight: 500,
                                    textDecoration: "none", transition: "all 0.15s",
                                }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.08)"; (e.currentTarget as HTMLElement).style.color = "#f0f0f5"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#c0c0d0"; }}
                            >
                                <span style={{ color: "#6366f1" }}>{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Disconnect */}
                    <div style={{ padding: "8px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <button
                            onClick={() => { disconnect(); setOpen(false); router.push("/"); }}
                            style={{
                                display: "flex", alignItems: "center", gap: 10,
                                width: "100%", padding: "10px 16px",
                                background: "none", border: "none",
                                color: "#f87171", fontSize: "0.85rem", fontWeight: 500,
                                cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.08)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                            <LogOut className="w-4 h-4" />
                            Disconnect Wallet
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
