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

    useEffect(() => {
        if (!address) { setProfile(null); return; }
        supabase
            .from("profiles")
            .select("display_name, title, avatar_url")
            .eq("wallet", address.toLowerCase())
            .single()
            .then(({ data }) => setProfile(data));
    }, [address]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    if (!isConnected || !address) return null;

    const initials = profile?.display_name
        ? profile.display_name[0].toUpperCase()
        : address.slice(2, 4).toUpperCase();
    const shortAddress = `${address.slice(0, 6)}…${address.slice(-4)}`;
    const displayName = profile?.display_name || shortAddress;

    const menuItems = [
        { icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard",    href: "/dashboard" },
        { icon: <User className="w-4 h-4" />,            label: "View Profile", href: `/profile/${address}` },
        { icon: <Settings className="w-4 h-4" />,        label: "Edit Profile", href: "/profile/edit" },
    ];

    return (
        <div ref={ref} className="relative">
            {/* Trigger */}
            <button
                onClick={() => setOpen((o) => !o)}
                className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border transition-all duration-150 cursor-pointer ${
                    open
                        ? "bg-[#E9F9F0] border-[#1DBF73]/40"
                        : "bg-white border-[#E4E5E7] hover:border-[#1DBF73]/40 hover:bg-[#F0FBF6]"
                }`}
            >
                {profile?.avatar_url ? (
                    <Image src={profile.avatar_url} width={28} height={28} alt={displayName}
                        className="w-7 h-7 rounded-full object-cover" />
                ) : (
                    <div className="w-7 h-7 rounded-full bg-[#1DBF73] flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {initials}
                    </div>
                )}
                <span className="text-sm font-medium text-[#404145] max-w-[100px] truncate">
                    {displayName}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#74767E] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute top-[calc(100%+6px)] right-0 w-56 bg-white border border-[#E4E5E7] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.10)] z-50 overflow-hidden">
                    {/* Profile header */}
                    <div className="px-4 py-3 border-b border-[#F0F0F0] bg-[#FAFAFA]">
                        <p className="text-sm font-semibold text-[#404145] truncate">{displayName}</p>
                        {profile?.title && (
                            <p className="text-xs text-[#74767E] mt-0.5">{profile.title}</p>
                        )}
                        <p className="text-xs text-[#95979D] mt-1 font-mono">{shortAddress}</p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                        {menuItems.map((item) => (
                            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#74767E] hover:text-[#404145] hover:bg-[#F7F7F7] transition-colors">
                                <span className="text-[#1DBF73]">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Disconnect */}
                    <div className="py-1 border-t border-[#F0F0F0]">
                        <button
                            onClick={() => { disconnect(); setOpen(false); router.push("/"); }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
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
