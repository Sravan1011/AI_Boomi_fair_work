"use client";

import { useRef, useCallback, useState, type ReactNode } from 'react';

interface BorderGlowProps {
  children?: ReactNode;
  className?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  style?: React.CSSProperties;
}

const BorderGlow: React.FC<BorderGlowProps> = ({
  children,
  className = '',
  backgroundColor = 'rgba(10, 10, 22, 0.85)',
  borderRadius = 28,
  glowIntensity = 1.0,
  coneSpread = 75,
  style,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [cursorAngle, setCursorAngle] = useState(0);
  const [edgeProximity, setEdgeProximity] = useState(0);

  const getCenter = useCallback((el: HTMLElement) => {
    const { width, height } = el.getBoundingClientRect();
    return [width / 2, height / 2];
  }, []);

  const getEdgeProximity = useCallback((el: HTMLElement, x: number, y: number) => {
    const [cx, cy] = getCenter(el);
    const dx = x - cx, dy = y - cy;
    const kx = dx !== 0 ? cx / Math.abs(dx) : Infinity;
    const ky = dy !== 0 ? cy / Math.abs(dy) : Infinity;
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  }, [getCenter]);

  const getCursorAngle = useCallback((el: HTMLElement, x: number, y: number) => {
    const [cx, cy] = getCenter(el);
    const dx = x - cx, dy = y - cy;
    if (dx === 0 && dy === 0) return 0;
    let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (deg < 0) deg += 360;
    return deg;
  }, [getCenter]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setEdgeProximity(getEdgeProximity(el, e.clientX - rect.left, e.clientY - rect.top));
    setCursorAngle(getCursorAngle(el, e.clientX - rect.left, e.clientY - rect.top));
  }, [getEdgeProximity, getCursorAngle]);

  // Smoothstep — activates when cursor is in outer 70% toward edge
  const raw = isHovered ? Math.max(0, (edgeProximity - 0.3) / 0.7) : 0;
  const t = Math.min(raw * raw * (3 - 2 * raw) * glowIntensity, 1);

  const startAngle = (cursorAngle - coneSpread / 2 + 360) % 360;
  const half = coneSpread / 2;

  // Cone mask — only show glow in cursor direction
  const coneMask = `conic-gradient(from ${startAngle.toFixed(1)}deg at 50% 50%, transparent 0deg, black ${half.toFixed(1)}deg, black ${coneSpread.toFixed(1)}deg, transparent ${(coneSpread + 1).toFixed(1)}deg, transparent 360deg)`;

  // Gradient for the thin border line
  const ringGradient = `conic-gradient(from ${startAngle.toFixed(1)}deg, #c084fc 0deg, #f472b6 ${half.toFixed(1)}deg, #38bdf8 ${coneSpread.toFixed(1)}deg, transparent ${(coneSpread + 2).toFixed(1)}deg, transparent 360deg)`;

  const eased = t;
  const trans = isHovered ? 'opacity 0.1s ease-out' : 'opacity 0.5s ease-in-out';

  return (
    // Outer wrapper — no overflow hidden, allows glow to bleed outside
    <div
      ref={wrapperRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => { setIsHovered(false); setEdgeProximity(0); }}
      className={`relative ${className}`}
      style={{ borderRadius: `${borderRadius}px` }}
    >
      {/* ── GLOW LAYER (behind card) ─────────────────────────────────────
          Sits BEHIND the card. Its box-shadow bleeds outward past the card
          boundary into the dark background — this is the actual light bleed.
          The card on top (z-index 1) covers the center so only the outer
          spread is visible.                                                */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          zIndex: 0,
          boxShadow: [
            `0 0  10px  4px rgba(192,132,252, ${(eased * 0.95).toFixed(3)})`,
            `0 0  22px 10px rgba(192,132,252, ${(eased * 0.75).toFixed(3)})`,
            `0 0  32px 14px rgba(244,114,182, ${(eased * 0.65).toFixed(3)})`,
            `0 0  45px 18px rgba( 56,189,248, ${(eased * 0.55).toFixed(3)})`,
            `0 0  60px 22px rgba(192,132,252, ${(eased * 0.35).toFixed(3)})`,
          ].join(', '),
          maskImage: coneMask,
          WebkitMaskImage: coneMask,
          opacity: eased,
          transition: trans,
        }}
      />

      {/* ── CARD (above glow layer) ──────────────────────────────────── */}
      <div
        className="relative"
        style={{
          zIndex: 1,
          background: backgroundColor,
          borderRadius: `${borderRadius}px`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)',
          ...style,
        }}
      >
        {/* Thin gradient border ring on top of card */}
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-[inherit]"
          style={{
            inset: -1,
            padding: 1.5,
            background: ringGradient,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            opacity: Math.min(eased * 1.2, 1),
            transition: trans,
          }}
        />

        {/* Content */}
        <div className="relative z-[1] h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BorderGlow;
