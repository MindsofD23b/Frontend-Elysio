import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/lib/auth/AuthProvider";

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://elysio.jamiepoeffel.ch";

interface IncomingMessage {
    id: string;
    roomId: string;
    senderId: string;
    type: string;
    createdAt: string;
    ciphertext: string;
    iv: string;
    authTag: string;
    encryptedKeys: { userId: string; encryptedKey: string }[];
}

export function useRoomSocket(roomId: string, onMessage: (msg: IncomingMessage) => void) {
    const { token } = useAuth();
    const socketRef = useRef<Socket | null>(null);
    const onMessageRef = useRef(onMessage);
    onMessageRef.current = onMessage;

    useEffect(() => {
        if (!token || !roomId) return;

        const socket = io(`${SOCKET_URL}`, {
            auth: { token },
            transports: ["polling", "websocket"],
            reconnection: true,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("✅ WS connected:", socket.id);
            socket.emit("join_room", { roomId });
        });

        socket.on("new_message", (msg: IncomingMessage) => {
            onMessageRef.current(msg);
        });

        socket.on("connect_error", (err) => {
            console.error("❌ WS connect_error:", err.message, err);
        });

        socket.on("disconnect", (reason) => {
            console.warn("⚠️ WS disconnected:", reason);
        });
        return () => {
            socket.emit("leave_room", { roomId });
            socket.disconnect();
        };
    }, [token, roomId]);
}
