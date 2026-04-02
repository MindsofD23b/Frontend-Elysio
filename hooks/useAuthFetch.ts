import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "@/hooks/useStore";
import { useAuth } from "@/lib/auth/AuthProvider";

type FetchOptions = {
    manual?: boolean;
    useCache?: boolean;
    cacheKey?: string;
    ttlMs?: number;
};

type CachedData<S> = {
    data: S;
    ttl: number;
    created_at: number;
};
// made with Pinterest and ChatGPT
const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "https://elysio.jamiepoeffel.ch";

export function useAuthFetch<S>(
    route: string,
    requestInit: RequestInit = {},
    options?: FetchOptions,
) {
    const { token, isLoading: authLoading } = useAuth();

    const cacheKey = useMemo(
        () => options?.cacheKey ?? `auth:${route}`,
        [options?.cacheKey, route],
    );

    const [fetchData, setFetchData, free] = useStore<CachedData<S> | null>(
        cacheKey,
        null,
    );

    const [loading, setLoading] = useState(!(options?.manual ?? false));
    const [error, setError] = useState<Error | null>(null);

    const isCached =
        options?.useCache !== false &&
        fetchData !== null &&
        Date.now() - fetchData.created_at < fetchData.ttl;

    const run = useCallback(
        async (overrideInit?: RequestInit) => {
            if (!token) {
                const authError = new Error("Unauthorized");
                setError(authError);
                throw authError;
            }

            setLoading(true);
            setError(null);

            try {
                if (!isCached) {
                    free();
                }

                const finalHeaders = {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    ...(requestInit.headers || {}),
                    ...(overrideInit?.headers || {}),
                };

                const finalInit: RequestInit = {
                    ...requestInit,
                    ...overrideInit,
                    headers: finalHeaders,
                };

                console.log("useAuthFetch route", route);

                const response = await fetch(`${BASE_URL}${route}`, finalInit);
                const text = await response.text();
                const json = text ? JSON.parse(text) : null;

                if (!response.ok) {
                    throw new Error(
                        Array.isArray(json?.message)
                            ? json.message.join(", ")
                            : json?.message || "Request failed",
                    );
                }

                if (options?.useCache !== false) {
                    setFetchData({
                        data: json as S,
                        ttl: options?.ttlMs ?? 5 * 60 * 1000,
                        created_at: Date.now(),
                    });
                }

                return json as S;
            } catch (err) {
                const finalError =
                    err instanceof Error ? err : new Error("Unknown error");
                setError(finalError);
                throw finalError;
            } finally {
                setLoading(false);
            }
        },
        [
            free,
            isCached,
            options?.ttlMs,
            options?.useCache,
            requestInit,
            route,
            setFetchData,
            token,
        ],
    );

    useEffect(() => {
        if (authLoading) return;

        if (!token) {
            setLoading(false);
            return;
        }

        if (options?.manual) {
            setLoading(false);
            return;
        }

        if (isCached) {
            setLoading(false);
            return;
        }

        run().catch(() => {});
    }, [authLoading, isCached, options?.manual, run, token]);

    return [fetchData?.data ?? null, loading, error, run] as const;
}
