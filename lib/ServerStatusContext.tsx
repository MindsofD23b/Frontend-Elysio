import { createContext, useContext, useEffect, useRef, useState } from "react";

type ServerStatus = "pending" | "ok" | "down" | "update";

const ServerStatusContext = createContext<ServerStatus>("pending");

const SERVER_URL = "https://elysio.jamiepoeffel.ch";
const CHECK_INTERVAL = 20_000;

export function ServerStatusProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<ServerStatus>("pending");
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
        check();
        intervalRef.current = setInterval(check, CHECK_INTERVAL);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    return (
        <ServerStatusContext.Provider value={status}>
            {children}
        </ServerStatusContext.Provider>
    );
}

export function useServerStatus() {
    return useContext(ServerStatusContext);
}
