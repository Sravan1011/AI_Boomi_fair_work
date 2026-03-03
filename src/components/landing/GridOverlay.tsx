"use client";

import { useEffect, useRef } from "react";

interface Dot {
    ox: number; // origin x
    oy: number; // origin y
    x: number;  // current x
    y: number;  // current y
    vx: number; // velocity x
    vy: number; // velocity y
}

const SPACING = 28;         // distance between dots — smaller = more dots
const DOT_RADIUS = 1.2;     // dot size in px
const INFLUENCE_RADIUS = 110; // mouse effect range in px
const REPULSION_STRENGTH = 50; // max displacement in px
const SPRING = 0.08;        // how fast dots snap back (0-1)
const FRICTION = 0.75;      // velocity damping

export default function GridOverlay() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -9999, y: -9999 });
    const dotsRef = useRef<Dot[]>([]);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Resize canvas to fill window
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            buildDots();
        };

        const buildDots = () => {
            const dots: Dot[] = [];
            const cols = Math.ceil(canvas.width / SPACING) + 1;
            const rows = Math.ceil(canvas.height / SPACING) + 1;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const x = c * SPACING;
                    const y = r * SPACING;
                    dots.push({ ox: x, oy: y, x, y, vx: 0, vy: 0 });
                }
            }
            dotsRef.current = dots;
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;

            for (const dot of dotsRef.current) {
                // Vector from mouse to dot
                const dx = dot.x - mx;
                const dy = dot.y - my;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < INFLUENCE_RADIUS) {
                    // Repel — push dot away from cursor
                    const force = (1 - dist / INFLUENCE_RADIUS) * REPULSION_STRENGTH;
                    const angle = Math.atan2(dy, dx);
                    dot.vx += Math.cos(angle) * force * 0.3;
                    dot.vy += Math.sin(angle) * force * 0.3;
                }

                // Spring back to origin
                dot.vx += (dot.ox - dot.x) * SPRING;
                dot.vy += (dot.oy - dot.y) * SPRING;

                // Friction
                dot.vx *= FRICTION;
                dot.vy *= FRICTION;

                // Update position
                dot.x += dot.vx;
                dot.y += dot.vy;

                // Brightness based on displacement from origin
                const displacement = Math.sqrt(
                    (dot.x - dot.ox) ** 2 + (dot.y - dot.oy) ** 2
                );
                const brightnessBoost = Math.min(displacement / 20, 1);
                const alpha = 0.18 + brightnessBoost * 0.45;

                // Draw dot — white, with indigo tint when near cursor
                if (dist < INFLUENCE_RADIUS) {
                    const t = 1 - dist / INFLUENCE_RADIUS;
                    const r = Math.round(99 + t * 60);
                    const g = Math.round(102 + t * 20);
                    const b = Math.round(241);
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                } else {
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                }

                ctx.beginPath();
                ctx.arc(dot.x, dot.y, DOT_RADIUS + brightnessBoost * 0.8, 0, Math.PI * 2);
                ctx.fill();
            }

            rafRef.current = requestAnimationFrame(draw);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("resize", resize);
        resize();
        draw();

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none fixed inset-0 z-40"
            aria-hidden="true"
        />
    );
}
