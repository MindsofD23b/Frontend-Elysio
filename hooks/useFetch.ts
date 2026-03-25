import { useStore } from "@/hooks/useStore";
import { useEffect, useState } from "react";

export function useFetch<S>(route: string, obj: RequestInit) {
    const [fetchData, setFetchData, free] = useStore<{
        data: S;
        ttl: number;
        created_at: number;
    } | null>(route, null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [cached, setCached] = useState(false);

    const [token] = useStore("token");

    if (fetchData !== null) {
        const currentTime = timestamp();
        if (currentTime - fetchData.created_at < fetchData.ttl) {
            setCached(true);
        }
    }

    useEffect(() => {
        const run = async () => {
            if (!cached) {
                free();

                obj.headers = {
                    Authorization: `Bearer ${token ? token : ""}`,
                    ...obj.headers,
                };

                const req = await fetch(route, obj);

                if (!req.ok) {
                    const err = await req.json();
                    setError(new Error(err.message));
                    setLoading(false);
                    return;
                }

                const data = await req.json();

                setFetchData({
                    data: data as S,
                    ttl: 5 * minToMil(60),
                    created_at: timestamp(),
                });

                setLoading(false);
            }
        };

        run();
    }, []);

    return [fetchData, loading, error] as const;
}

function minToMil(minutes: number): number {
    return minutes * 60 * 1000;
}

export function timestamp(): number {
    return Math.floor(Date.now() / 1000);
}
