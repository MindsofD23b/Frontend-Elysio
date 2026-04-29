import { createContext, useContext, useEffect, useRef, useState } from "react";
import * as Network from "expo-network";

type ServerStatus = "pending" | "ok" | "down" | "update";

const ServerStatusContext = createContext<ServerStatus>("pending");

const SERVER_URL = "https://elysio.jamiepoeffel.ch";
const CHECK_INTERVAL = 20_000;

export function ServerStatusProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<ServerStatus>("pending");
    const [isConnected, setIsConnected] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        Network.getNetworkStateAsync().then((state) => {
            setIsConnected(!!state.isConnected);
        });

        const poll = setInterval(async () => {
            const state = await Network.getNetworkStateAsync();
            setIsConnected(!!state.isConnected);
        }, CHECK_INTERVAL);

        return () => clearInterval(poll);
    }, []);

    async function check() {
        try {
            const res = await fetch(SERVER_URL, { method: "GET", cache: "no-store" });
            const text = (await res.text()).trim();
            if (res.ok && text === "Hello World!") {
                setStatus("ok");
            } else if (text.startsWith("update")) {
                setStatus("update");
            } else {
                setStatus("down");
            }
        } catch {
            setStatus("down");
        }
    }

    useEffect(() => {
        if (!isConnected) return;

        check();
        intervalRef.current = setInterval(check, CHECK_INTERVAL);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isConnected]);

    return (
        <ServerStatusContext.Provider value={status}>
            {children}
        </ServerStatusContext.Provider>
    );
}

export function useServerStatus() {
    return useContext(ServerStatusContext);
}
