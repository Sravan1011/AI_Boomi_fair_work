"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Wallet, ChevronDown, AlertTriangle, Zap } from "lucide-react";
import { useState, useRef } from "react";

// ─── 3D button primitives ──────────────────────────────────────────────────────

interface Btn3DProps {
    onClick: () => void;
    children: React.ReactNode;
    variant?: "connect" | "connected" | "error";
    compact?: boolean;
}

function Btn3D({ onClick, children, variant = "connect", compact = false }: Btn3DProps) {
    const [pressed, setPressed] = useState(false);
    const [hovered, setHovered] = useState(false);

    // Tilt effect on hover
    const ref = useRef<HTMLButtonElement>(null);
    const rotateX = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });
    const rotateY = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!ref.current || pressed) return;
        const rect = ref.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        rotateX.set(-dy * 8);
        rotateY.set(dx * 8);
    };

    const resetTilt = () => {
        rotateX.set(0);
        rotateY.set(0);
    };

    // Variant styles
    const V = {
        connect: {
            face:       "linear-gradient(160deg, #23d47e 0%, #1DBF73 45%, #16a862 100%)",
            highlight:  "rgba(255,255,255,0.22)",
            ledge:      "#0c5c38",
            ledgePx:    6,
            glow:       "rgba(29,191,115,0.55)",
            glowBlur:   28,
            text:       "#ffffff",
            border:     "rgba(255,255,255,0.12)",
        },
        connected: {
            face:       "linear-gradient(160deg, #182b20 0%, #0f1a14 100%)",
            highlight:  "rgba(29,191,115,0.12)",
            ledge:      "#050e08",
            ledgePx:    4,
            glow:       "rgba(29,191,115,0.22)",
            glowBlur:   18,
            text:       "#1DBF73",
            border:     "rgba(29,191,115,0.30)",
        },
        error: {
            face:       "linear-gradient(160deg, #f97171 0%, #ef4444 100%)",
            highlight:  "rgba(255,255,255,0.18)",
            ledge:      "#7f1d1d",
            ledgePx:    5,
            glow:       "rgba(239,68,68,0.45)",
            glowBlur:   22,
            text:       "#ffffff",
            border:     "rgba(255,255,255,0.10)",
        },
    }[variant];

    const depth = pressed ? 1 : hovered ? V.ledgePx + 1 : V.ledgePx;
    const shadowY = pressed ? 1 : hovered ? V.ledgePx + 2 : V.ledgePx;

    return (
        <motion.button
            ref={ref}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); resetTilt(); }}
            onMouseMove={handleMouseMove}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                perspective: 600,
                translateY: pressed ? depth - 1 : 0,
                transition: "translate 0.08s ease",
            }}
            className="relative select-none outline-none cursor-pointer"
        >
            {/* ── Ledge (3D bottom face) ── */}
            <div
                className="absolute inset-0 rounded-full"
                style={{
                    background: `linear-gradient(180deg, ${V.ledge} 0%, rgba(0,0,0,0.6) 100%)`,
                    transform: `translateY(${depth}px)`,
                    transition: "transform 0.08s ease",
                    borderRadius: "9999px",
                }}
            />

            {/* ── Side walls (left/right depth) ── */}
            <div
                className="absolute inset-0 rounded-full opacity-60"
                style={{
                    background: V.ledge,
                    transform: `translateY(${depth / 2}px) scaleY(1.04)`,
                    transition: "transform 0.08s ease",
                    filter: "blur(1px)",
                }}
            />

            {/* ── Glow halo ── */}
            <div
                className="absolute rounded-full pointer-events-none"
                style={{
                    inset: "-4px",
                    background: `radial-gradient(ellipse at 50% 50%, ${V.glow} 0%, transparent 70%)`,
                    filter: `blur(${V.glowBlur}px)`,
                    opacity: hovered ? 1 : pressed ? 0.6 : 0.75,
                    transition: "opacity 0.2s ease",
                }}
            />

            {/* ── Button face ── */}
            <div
                className="relative flex items-center gap-2 font-semibold"
                style={{
                    padding: compact ? "6px 14px" : "10px 22px",
                    borderRadius: "9999px",
                    background: V.face,
                    color: V.text,
                    fontSize: compact ? "12px" : "13.5px",
                    letterSpacing: "-0.01em",
                    border: `1px solid ${V.border}`,
                    boxShadow: [
                        `inset 0 1.5px 0 ${V.highlight}`,
                        `inset 0 -1px 0 rgba(0,0,0,0.18)`,
                        `0 1px 0 rgba(255,255,255,0.04)`,
                    ].join(", "),
                    transform: `translateY(${pressed ? depth - 1 : 0}px)`,
                    transition: "transform 0.08s ease, box-shadow 0.08s ease",
                    willChange: "transform",
                }}
            >
                {/* Top sheen — curved glass effect */}
                <div
                    className="absolute inset-x-2 top-0 h-[40%] rounded-full pointer-events-none"
                    style={{
                        background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)",
                        borderRadius: "9999px 9999px 60% 60%",
                    }}
                />

                {children}
            </div>
        </motion.button>
    );
}

// ─── Wallet icon with pulse ────────────────────────────────────────────────────

function WalletIcon({ connected }: { connected?: boolean }) {
    return (
        <div className="relative shrink-0">
            <Wallet className="w-4 h-4" />
            {connected && (
                <motion.div
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#1DBF73]"
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
            )}
        </div>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function WalletButton() {
    return (
        <ConnectButton.Custom>
            {({ account, chain, openConnectModal, openAccountModal, openChainModal, mounted }) => {
                if (!mounted) return null;

                // ── Not connected ──────────────────────────────────────────
                if (!account) {
                    return (
                        <Btn3D onClick={openConnectModal} variant="connect">
                            <WalletIcon />
                            Connect Wallet
                        </Btn3D>
                    );
                }

                // ── Wrong network ──────────────────────────────────────────
                if (chain?.unsupported) {
                    return (
                        <Btn3D onClick={openChainModal} variant="error">
                            <AlertTriangle className="w-4 h-4" />
                            Wrong Network
                        </Btn3D>
                    );
                }

                // ── Connected ──────────────────────────────────────────────
                return (
                    <div className="flex items-center gap-2">
                        {/* Chain pill */}
                        {chain && (
                            <motion.button
                                onClick={openChainModal}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold"
                                style={{
                                    background: "#0d1f15",
                                    border: "1px solid rgba(29,191,115,0.25)",
                                    color: "#1DBF73",
                                    boxShadow: "0 0 10px rgba(29,191,115,0.15)",
                                }}
                            >
                                {chain.hasIcon && chain.iconUrl && (
                                    <img src={chain.iconUrl} alt={chain.name} className="w-3 h-3 rounded-full" />
                                )}
                                {chain.name}
                            </motion.button>
                        )}

                        {/* Account 3D button */}
                        <Btn3D onClick={openAccountModal} variant="connected" compact>
                            <WalletIcon connected />
                            <span className="font-mono" style={{ fontSize: "12px" }}>
                                {account.displayName}
                            </span>
                            <ChevronDown className="w-3 h-3 opacity-60" />
                        </Btn3D>
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
}
