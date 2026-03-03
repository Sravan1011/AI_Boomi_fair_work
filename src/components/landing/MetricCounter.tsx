"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface MetricCounterProps {
    end: number;
    suffix?: string;
    prefix?: string;
    duration?: number;
    decimals?: number;
}

export default function MetricCounter({
    end,
    suffix = "",
    prefix = "",
    duration = 2,
    decimals = 0,
}: MetricCounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!isInView) return;

        let startTime: number;
        let animationId: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCurrent(eased * end);

            if (progress < 1) {
                animationId = requestAnimationFrame(animate);
            }
        };

        animationId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationId);
    }, [isInView, end, duration]);

    return (
        <span ref={ref} className="tabular-nums">
            {prefix}
            {current.toFixed(decimals)}
            {suffix}
        </span>
    );
}
