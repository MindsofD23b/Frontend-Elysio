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
