import { useEffect, useRef, useState } from "react";

const PING_URL = "https://elysio.jamiepoeffel.ch";
const PING_INTERVAL_MS = 5_000;
// Poor = response takes longer than this, or request fails
const POOR_THRESHOLD_MS = 2_000;
// How long poor quality must persist before auto-navigating
const POOR_DURATION_BEFORE_ACTION_MS = 8_000;

export type ConnectionQuality = "good" | "poor" | "unknown";

export function useConnectionQuality(onPoorConnection?: () => void) {
    const [quality, setQuality] = useState<ConnectionQuality>("unknown");
    const poorSinceRef = useRef<number | null>(null);
    const hasTriggeredRef = useRef(false);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        hasTriggeredRef.current = false;

        async function ping() {
            if (!mountedRef.current) return;
            const start = Date.now();
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), POOR_THRESHOLD_MS);
                await fetch(PING_URL, {
                    method: "HEAD",
                    cache: "no-store",
                    signal: controller.signal,
                });
                clearTimeout(timeout);

                const elapsed = Date.now() - start;
                if (!mountedRef.current) return;

                if (elapsed < POOR_THRESHOLD_MS) {
                    setQuality("good");
                    poorSinceRef.current = null;
                    hasTriggeredRef.current = false;
                } else {
                    markPoor();
                }
            } catch {
                if (!mountedRef.current) return;
                markPoor();
            }
        }

        function markPoor() {
            setQuality("poor");
            if (poorSinceRef.current === null) {
                poorSinceRef.current = Date.now();
            }
            const poorDuration = Date.now() - poorSinceRef.current;
            if (
                !hasTriggeredRef.current &&
                poorDuration >= POOR_DURATION_BEFORE_ACTION_MS
            ) {
                hasTriggeredRef.current = true;
                onPoorConnection?.();
            }
        }

        ping();
        const interval = setInterval(ping, PING_INTERVAL_MS);

        return () => {
            mountedRef.current = false;
            clearInterval(interval);
        };
    }, [onPoorConnection]);

    return quality;
}
