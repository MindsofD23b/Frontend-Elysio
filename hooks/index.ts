import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useCallback } from "react";
import { ErrResp, SucResp } from "@/hooks/index.d";

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

export function useFetch<S>(route: string, obj: RequestInit) {
    const [fetchData, setFetchData, free] = useStore<{
        data: S;
        ttl: number;
        created_at: number;
    } | null>(route, null);

    const base = 'https://elysio.jamiepoeffel.ch'

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

                const req = await fetch(base + route, obj);

                if (!req.ok) {
                    const err = (await req.json()) as ErrResp;
                    setError(new Error(err.message));
                    setLoading(false);
                    return;
                }

                const data = (await req.json()) as SucResp;

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
