import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useCallback } from "react";

const ramStore = new Map<string, any>();

export function useStore<S>(
    keyValue: string,
    initialValue?: S,
): readonly [S, (newVal: S) => void, () => void, boolean] {
    const key = `store_${keyValue}`;

    const [value, setValue] = useState<S>(() =>
        ramStore.has(key) ? ramStore.get(key) : initialValue,
    );
    const [loaded, setLoaded] = useState(ramStore.has(key));

    useEffect(() => {
        if (loaded) return;
        AsyncStorage.getItem(key).then((stored) => {
            if (stored !== null) {
                const parsed = JSON.parse(stored) as S;
                ramStore.set(key, parsed);
                setValue(parsed);
            }
            setLoaded(true);
        });
    }, []);

    const setFunc = useCallback(
        (newVal: S) => {
            ramStore.set(key, newVal);
            setValue(newVal);
            AsyncStorage.setItem(key, JSON.stringify(newVal)).catch(console.error);
        },
        [key],
    );

    const clearFunc = useCallback(() => {
        ramStore.delete(key);
        setValue(initialValue!);
        AsyncStorage.removeItem(key).catch(console.error);
    }, [key]);

    return [value, setFunc, clearFunc, loaded] as const;
}

export function useFetch<S>(
    route: string,
    obj: RequestInit,
    options?: {
        manual?: boolean;
        useCache?: boolean;
    },
) {
    const [fetchData, setFetchData, free] = useStore<{
        data: S;
        ttl: number;
        created_at: number;
    } | null>(route, null);

    const base = process.env.EXPO_PUBLIC_BACKEND_URL || "https://elysio.jamiepoeffel.ch";

    const [loading, setLoading] = useState(!(options?.manual ?? false));
    const [error, setError] = useState<Error | null>(null);

    const [token] = useStore<string | null>("token", null);

    const isCached =
        options?.useCache !== false &&
        fetchData !== null &&
        timestamp() - fetchData.created_at < fetchData.ttl;

    const run = useCallback(
        async (overrideObj?: RequestInit) => {
            setLoading(true);
            setError(null);

            try {
                if (!isCached) {
                    free();
                }

                const finalHeaders = {
                    Authorization: `Bearer ${token ? token : ""}`,
                    ...(obj.headers || {}),
                    ...(overrideObj?.headers || {}),
                };

                const finalObj: RequestInit = {
                    ...obj,
                    ...overrideObj,
                    headers: finalHeaders,
                };

                const req = await fetch(base + route, finalObj);

                const text = await req.text();
                const json = text ? JSON.parse(text) : null;

                if (!req.ok) {
                    const err = json;
                    throw new Error(
                        Array.isArray(err?.message)
                            ? err.message.join(", ")
                            : err?.message || "Request failed",
                    );
                }

                const data = json;

                if (options?.useCache !== false) {
                    setFetchData({
                        data: data as S,
                        ttl: 5 * minToMil(60),
                        created_at: timestamp(),
                    });
                }

                setLoading(false);
                return data as S;
            } catch (err) {
                const finalError =
                    err instanceof Error ? err : new Error("Unknown error");
                setError(finalError);
                setLoading(false);
                throw finalError;
            }
        },
        [base, route, obj, token, isCached, free, setFetchData, options?.useCache],
    );

    useEffect(() => {
        if (options?.manual) {
            setLoading(false);
            return;
        }

        if (isCached) {
            setLoading(false);
            return;
        }

        run();
    }, [isCached, run, options?.manual]);

    return [fetchData?.data ?? null, loading, error, run] as const;
}
function minToMil(minutes: number): number {
    return minutes * 60 * 1000;
}

export function timestamp(): number {
    return Math.floor(Date.now() / 1000);
}
