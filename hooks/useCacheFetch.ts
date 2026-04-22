import { useCallback, useMemo, useState } from "react";
import { useStore } from "@/hooks/useStore";
import { useAuth } from "@/lib/auth/AuthProvider";

type FetchOptions = {
    manual?: boolean;
    useCache: boolean;
    cacheKey?: string;
    ttlMs: number;
};

type CachedData<S> = {
    data: S;
    ttl: number;
    created_at: number;
};
// made with Pinterest and ChatGPT
const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "https://elysio.jamiepoeffel.ch";

export function useCacheFetch<S>(
    route: string,
    requestInit: RequestInit = {},
    options: FetchOptions,
) {
    const { token } = useAuth();

    const cacheKey = useMemo(
        () => options?.cacheKey ?? `auth:${route}`,
        [options?.cacheKey, route],
    );

    const [fetchData, setFetchData, free] = useStore<CachedData<S> | null>(
        cacheKey,
        null,
    );

    const [error, setError] = useState<Error | null>(null);

    const isCached =
        options?.useCache !== false &&
        fetchData !== null &&
        Date.now() - fetchData.created_at < fetchData.ttl;

    const run = useCallback(
        async (overrideInit?: RequestInit, path?: RequestInfo) => {
            if (!token) {
                const authError = new Error("Unauthorized");
                setError(authError);
                throw authError;
            }

            setError(null);

            try {
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

                console.log("cache route", route);

                const response = await fetch(
                    path ? `${BASE_URL}${path}` : `${BASE_URL}${route}`,
                    finalInit,
                );
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

    return [fetchData?.data, error, run] as const;
}
