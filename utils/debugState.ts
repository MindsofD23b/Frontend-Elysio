import { useEffect, useState } from "react";

let _enabled = false;
const _listeners = new Set<(v: boolean) => void>();

export function isDebugEnabled() {
    return _enabled;
}

export function setDebugEnabled(v: boolean) {
    _enabled = v;
    _listeners.forEach((l) => l(v));
}

export function useDebugEnabled() {
    const [val, setVal] = useState(_enabled);
    useEffect(() => {
        _listeners.add(setVal);
        return () => {
            _listeners.delete(setVal);
        };
    }, []);
    return val;
}
