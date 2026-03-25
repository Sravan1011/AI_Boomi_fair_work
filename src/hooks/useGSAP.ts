"use client";

import { useEffect, useRef } from "react";

type GSAPContextCallback = (gsap: typeof import("gsap").gsap) => void | (() => void);

/**
 * Safe GSAP hook for Next.js. Lazy-loads gsap + ScrollTrigger only on the
 * client so the SSR pass never touches the GSAP bundle.
 */
export function useGSAP(callback: GSAPContextCallback, deps: unknown[] = []) {
    const cleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        let ctx: { revert: () => void } | undefined;

        Promise.all([
            import("gsap").then((m) => m.gsap ?? m.default),
            import("gsap/ScrollTrigger").then((m) => m.ScrollTrigger ?? m.default),
        ]).then(([gsap, ScrollTrigger]) => {
            gsap.registerPlugin(ScrollTrigger);
            ctx = gsap.context(() => {
                const userCleanup = callback(gsap);
                if (typeof userCleanup === "function") {
                    cleanupRef.current = userCleanup;
                }
            });
        });

        return () => {
            ctx?.revert();
            cleanupRef.current?.();
            cleanupRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}
