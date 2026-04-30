import React, {
    createContext,
    useContext,
    useEffect,
    useCallback,
    useState,
    useMemo,
} from "react";
import { useDebugEnabled } from "@/utils/debugState";

export type DebugRow = { label: string; value: string };
export type DebugLog = { ts: string; section: string; msg: string };
export type DebugAction = {
    key: string;
    label: string;
    active?: boolean;
    onPress: () => void;
};

type SectionEntry = { name: string; order: number; rows: DebugRow[] };

type DebugData = {
    sections: SectionEntry[];
    logs: DebugLog[];
    actions: DebugAction[];
};

type DebugMethods = {
    _registerSection: (name: string, order: number, rows: DebugRow[]) => void;
    _unregisterSection: (name: string) => void;
    _registerAction: (action: DebugAction) => void;
    _unregisterAction: (key: string) => void;
    addLog: (section: string, msg: string) => void;
};

const MethodsCtx = createContext<DebugMethods | null>(null);
const DataCtx = createContext<DebugData | null>(null);

function DebugProviderInner({ children }: { children: React.ReactNode }) {
    const [sections, setSections] = useState<SectionEntry[]>([]);
    const [logs, setLogs] = useState<DebugLog[]>([]);
    const [actions, setActions] = useState<DebugAction[]>([]);

    const _registerSection = useCallback(
        (name: string, order: number, rows: DebugRow[]) => {
            setSections((prev) => {
                const idx = prev.findIndex((s) => s.name === name);
                if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = { name, order, rows };
                    return next;
                }
                return [...prev, { name, order, rows }].sort((a, b) => a.order - b.order);
            });
        },
        [],
    );

    const _unregisterSection = useCallback((name: string) => {
        setSections((prev) => prev.filter((s) => s.name !== name));
    }, []);

    const _registerAction = useCallback((action: DebugAction) => {
        setActions((prev) => {
            const idx = prev.findIndex((a) => a.key === action.key);
            if (idx >= 0) {
                const next = [...prev];
                next[idx] = action;
                return next;
            }
            return [...prev, action];
        });
    }, []);

    const _unregisterAction = useCallback((key: string) => {
        setActions((prev) => prev.filter((a) => a.key !== key));
    }, []);

    const addLog = useCallback((section: string, msg: string) => {
        setLogs((prev) =>
            [{ ts: new Date().toISOString().slice(11, 23), section, msg }, ...prev].slice(
                0,
                300,
            ),
        );
    }, []);

    const methods = useMemo<DebugMethods>(
        () => ({
            _registerSection,
            _unregisterSection,
            _registerAction,
            _unregisterAction,
            addLog,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const data = useMemo<DebugData>(
        () => ({ sections, logs, actions }),
        [sections, logs, actions],
    );

    return (
        <MethodsCtx.Provider value={methods}>
            <DataCtx.Provider value={data}>{children}</DataCtx.Provider>
        </MethodsCtx.Provider>
    );
}

export function DebugProvider({ children }: { children: React.ReactNode }) {
    if (!__DEV__) return <>{children}</>;
    return <DebugProviderInner>{children}</DebugProviderInner>;
}

/** Read all debug data (sections, logs, actions) for the debug UI. */
export function useDebugCtx() {
    return useContext(DataCtx);
}

export function useDebugSection(
    name: string,
    rows: DebugRow[],
    deps: unknown[],
    order = 0,
) {
    const isDebug = useDebugEnabled();
    const methods = useContext(MethodsCtx);
    const allDeps = [methods, name, order, isDebug, ...deps];

    useEffect(() => {
        if (!isDebug || !methods) {
            methods?._unregisterSection(name);
            return;
        }
        methods._registerSection(name, order, rows);
        return () => methods._unregisterSection(name);
    }, allDeps);
}

export function useDebugActions(actions: DebugAction[], deps: unknown[]) {
    const isDebug = useDebugEnabled();
    const methods = useContext(MethodsCtx);
    useEffect(() => {
        if (!isDebug || !methods) {
            // Unregister all when debug is turned off
            actions.forEach((a) => methods?._unregisterAction(a.key));
            return;
        }
        actions.forEach((a) => methods._registerAction(a));
        return () => actions.forEach((a) => methods._unregisterAction(a.key));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [methods, isDebug, ...deps]);
}

export function useDebugLog(section: string) {
    const isDebug = useDebugEnabled();
    const methods = useContext(MethodsCtx);
    return useCallback(
        (msg: string) => {
            if (!isDebug) return;
            methods?.addLog(section, msg);
        },
        [methods, section, isDebug],
    );
}
