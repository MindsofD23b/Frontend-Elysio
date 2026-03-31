import { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { registerGlobals, mediaDevices, RTCView, MediaStream } from "react-native-webrtc";
import * as mediasoupClient from "mediasoup-client";
import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    Ionicons,
    MaterialCommunityIcons,
    Feather,
    FontAwesome6,
} from "@expo/vector-icons";

registerGlobals();

// made with chatgpt

const BASE_URL = "https://elysio.jamiepoeffel.ch";

export default function VideoCall() {
    const [started, setStarted] = useState(false);
    const [localUrl, setLocalUrl] = useState<string | null>(null);
    const [remoteUrl, setRemoteUrl] = useState<string | null>(null);
    const [ROOM_ID, setROOM_ID] = useState<string | null>(null);

    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);

    const peerIdRef = useRef(`peer-${Math.random().toString(36).slice(2, 10)}`);
    const deviceRef = useRef<any>(null);
    const sendTransportRef = useRef<any>(null);
    const recvTransportRef = useRef<any>(null);
    const socketRef = useRef<Socket | null>(null);

    const localStreamRef = useRef<any>(null);
    const remoteStreamRef = useRef<any>(new MediaStream());

    const consumedProducerIdsRef = useRef<Set<string>>(new Set());
    const startingRef = useRef(false);
    const consumingProducerIdsRef = useRef<Set<string>>(new Set());
    const consumersRef = useRef<Map<string, any>>(new Map());
    const remoteVideoStreamRef = useRef<any>(null);

    const [matchmakingReady, setMatchmakingReady] = useState(false);
    const [matchState, setMatchState] = useState<"idle" | "waiting" | "matched">("idle");
    const [matchedUserId, setMatchedUserId] = useState<string | null>(null);
    const [gatewayRoomId, setGatewayRoomId] = useState<string | null>(null);

    const matchmakingSocketRef = useRef<Socket | null>(null);

    async function api(path: string, options?: RequestInit) {
        const url = `${BASE_URL}${path}`;
        console.log("API REQUEST:", url, options?.method ?? "GET");

        try {
            const res = await fetch(url, {
                headers: { "Content-Type": "application/json" },
                ...options,
            });

            const text = await res.text();
            console.log("API RESPONSE:", res.status, text);

            if (!res.ok) throw new Error(`${res.status} ${text}`);
            return text ? JSON.parse(text) : {};
        } catch (error) {
            console.log("API FETCH FAILED:", url, error);
            throw error;
        }
    }

    async function connectMatchmakingGateway() {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
            console.log("No JWT token found for matchmaking socket");
            return;
        }

        if (matchmakingSocketRef.current?.connected) {
            return;
        }

        const socket = io(BASE_URL, {
            auth: {
                token,
            },
            transports: ["websocket"],
            forceNew: true,
        });

        matchmakingSocketRef.current = socket;

        socket.on("connect", () => {
            console.log("Matchmaking socket connected");
        });

        socket.on("disconnect", (reason) => {
            console.log("Matchmaking socket disconnected:", reason);
            setMatchmakingReady(false);
        });

        socket.on("socket_ready", (payload) => {
            console.log("socket_ready", payload);
            setMatchmakingReady(true);
        });

        socket.on("queue_waiting", (payload) => {
            console.log("queue_waiting", payload);
            setMatchState("waiting");
        });

        socket.on("match_found", (payload: { matchedUserId: string; roomId: string }) => {
            console.log("match_found", payload);
            setMatchState("matched");
            setMatchedUserId(payload.matchedUserId);
            setGatewayRoomId(payload.roomId);
            setROOM_ID(payload.roomId);
        });

        socket.on("room_ready", (payload: { roomId: string }) => {
            console.log("room_ready", payload);
            setGatewayRoomId(payload.roomId);
        });
    }

    async function consumeProducer(producerId: string) {
        const recvTransport = recvTransportRef.current;
        const device = deviceRef.current;

        if (!recvTransport || !device) return;
        if (consumedProducerIdsRef.current.has(producerId)) return;
        if (consumingProducerIdsRef.current.has(producerId)) return;

        consumingProducerIdsRef.current.add(producerId);

        try {
            const consumerData = await api(
                `/video/room/${ROOM_ID}/transport/${recvTransport.id}/consume`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        peerId: peerIdRef.current,
                        producerId,
                        rtpCapabilities: device.rtpCapabilities,
                    }),
                },
            );

            const consumer = await recvTransport.consume({
                id: consumerData.id,
                producerId: consumerData.producerId,
                kind: consumerData.kind,
                rtpParameters: consumerData.rtpParameters,
            });

            consumersRef.current.set(consumer.id, consumer);
            consumedProducerIdsRef.current.add(producerId);

            await api(`/video/room/${ROOM_ID}/consumer/${consumer.id}/resume`, {
                method: "POST",
                body: JSON.stringify({ peerId: peerIdRef.current }),
            });

            consumer.track.enabled = true;

            if (consumer.kind === "video") {
                const videoStream = new MediaStream([consumer.track]);
                remoteVideoStreamRef.current = videoStream;

                const url = videoStream.toURL();

                setTimeout(() => {
                    setRemoteUrl(url);
                }, 300);
            }
        } catch (err) {
            consumingProducerIdsRef.current.delete(producerId);
            console.error("consumeProducer error", err);
        }
    }

    async function createRecvTransportAndConsume(device: any) {
        const transportInfo = await api(`/video/room/${ROOM_ID}/transport`, {
            method: "POST",
            body: JSON.stringify({ peerId: peerIdRef.current }),
        });

        const recvTransport = device.createRecvTransport({
            ...transportInfo,
            iceServers: [
                {
                    urls: [
                        "turn:elysioturn.jamiepoeffel.ch:3478?transport=udp",
                        "turn:elysioturn.jamiepoeffel.ch:3478?transport=tcp",
                        "turns:elysioturn.jamiepoeffel.ch:5349?transport=tcp",
                    ],
                    username: "elysioturn",
                    credential: "q9E811BDjLsK",
                },
            ],
        });

        recvTransportRef.current = recvTransport;

        recvTransport.on(
            "connect",
            async ({ dtlsParameters }: any, callback: any, errback: any) => {
                try {
                    await api(
                        `/video/room/${ROOM_ID}/transport/${recvTransport.id}/connect`,
                        {
                            method: "POST",
                            body: JSON.stringify({
                                peerId: peerIdRef.current,
                                dtlsParameters,
                            }),
                        },
                    );
                    callback();
                } catch (err) {
                    errback(err);
                }
            },
        );

        const producers = await api(
            `/video/room/${ROOM_ID}/producers?peerId=${peerIdRef.current}`,
            { method: "GET" },
        );

        for (const producer of producers) {
            if (producer.peerId === peerIdRef.current) continue;
            await consumeProducer(producer.producerId);
        }
    }

    async function createSendTransportAndProduce(device: any, localStream: any) {
        const transportInfo = await api(`/video/room/${ROOM_ID}/transport`, {
            method: "POST",
            body: JSON.stringify({ peerId: peerIdRef.current }),
        });

        const sendTransport = device.createSendTransport({
            ...transportInfo,
            iceServers: [
                {
                    urls: [
                        "turn:elysioturn.jamiepoeffel.ch:3478?transport=udp",
                        "turn:elysioturn.jamiepoeffel.ch:3478?transport=tcp",
                        "turns:elysioturn.jamiepoeffel.ch:5349?transport=tcp",
                    ],
                    username: "elysioturn",
                    credential: "q9E811BDjLsK",
                },
            ],
        });

        sendTransportRef.current = sendTransport;

        sendTransport.on(
            "connect",
            async ({ dtlsParameters }: any, callback: any, errback: any) => {
                try {
                    await api(
                        `/video/room/${ROOM_ID}/transport/${sendTransport.id}/connect`,
                        {
                            method: "POST",
                            body: JSON.stringify({
                                peerId: peerIdRef.current,
                                dtlsParameters,
                            }),
                        },
                    );
                    callback();
                } catch (err) {
                    errback(err);
                }
            },
        );

        sendTransport.on(
            "produce",
            async ({ kind, rtpParameters }: any, callback: any, errback: any) => {
                try {
                    const data = await api(
                        `/video/room/${ROOM_ID}/transport/${sendTransport.id}/produce`,
                        {
                            method: "POST",
                            body: JSON.stringify({
                                peerId: peerIdRef.current,
                                kind,
                                rtpParameters,
                            }),
                        },
                    );
                    callback({ id: data.id });
                } catch (err) {
                    errback(err);
                }
            },
        );

        const audioTrack = localStream.getAudioTracks()[0];
        const videoTrack = localStream.getVideoTracks()[0];

        if (audioTrack) await sendTransport.produce({ track: audioTrack });
        if (videoTrack) await sendTransport.produce({ track: videoTrack });
    }

    async function startCall() {
        if (startingRef.current || started) return;
        startingRef.current = true;

        try {
            const localStream = await mediaDevices.getUserMedia({
                audio: true,
                video: { frameRate: 30, facingMode: "user" },
            });

            localStreamRef.current = localStream;
            setLocalUrl(localStream.toURL());

            const joinData = await api(`/video/room/${ROOM_ID}/join`, {
                method: "POST",
                body: JSON.stringify({ peerId: peerIdRef.current }),
            });

            const device = new mediasoupClient.Device();
            await device.load({ routerRtpCapabilities: joinData.rtpCapabilities });
            deviceRef.current = device;

            await createRecvTransportAndConsume(device);

            const socket: Socket = io(BASE_URL, {
                query: { peerId: peerIdRef.current, roomId: ROOM_ID },
                transports: ["websocket"],
                forceNew: true,
            });

            socketRef.current = socket;

            socket.on(
                "new-producer",
                async ({
                    producerId,
                    peerId,
                }: {
                    producerId: string;
                    peerId: string;
                }) => {
                    if (peerId === peerIdRef.current) return;
                    await consumeProducer(producerId);
                },
            );

            await createSendTransportAndProduce(device, localStream);

            setStarted(true);
        } catch (error) {
            console.error("startCall error", error);
            startingRef.current = false;
        }
    }

    async function stopCall() {
        matchmakingSocketRef.current?.disconnect();
        matchmakingSocketRef.current = null;
        setMatchmakingReady(false);
        setMatchState("idle");
        setMatchedUserId(null);
        setGatewayRoomId(null);
        startingRef.current = false;
        socketRef.current?.disconnect();
        socketRef.current = null;

        try {
            await fetch(`${BASE_URL}/video/room/${ROOM_ID}/leave`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ peerId: peerIdRef.current }),
            });
        } catch (err) {
            console.error("leave error", err);
        }

        sendTransportRef.current?.close();
        recvTransportRef.current?.close();
        localStreamRef.current?.getTracks()?.forEach((t: any) => t.stop());

        sendTransportRef.current = null;
        recvTransportRef.current = null;
        localStreamRef.current = null;
        remoteStreamRef.current = new MediaStream();

        consumersRef.current.forEach((consumer) => {
            try {
                consumer.close();
            } catch {}
        });

        consumersRef.current.clear();
        consumedProducerIdsRef.current.clear();
        consumingProducerIdsRef.current.clear();
        remoteVideoStreamRef.current = null;

        setLocalUrl(null);
        setRemoteUrl(null);
        setStarted(false);
    }

    function toggleMute() {
        const stream = localStreamRef.current;
        if (!stream) return;

        const nextMuted = !isMuted;
        stream.getAudioTracks().forEach((track: MediaStreamTrack) => {
            track.enabled = !nextMuted;
        });
        setIsMuted(nextMuted);
    }

    function toggleSpeaker() {
        const next = !isSpeakerOn;
        setIsSpeakerOn(next);

        Alert.alert("Speaker", `Speaker ${next ? "enabled" : "disabled"}`);

        // Für echtes Routing auf Lautsprecher brauchst du auf iOS/Android meist:
        // react-native-incall-manager oder eine native Audio Route Lösung
    }

    function handleLike() {
        Alert.alert("Liked", "User wurde geliked.");
    }

    function handleNextUser() {
        Alert.alert("Next user", "Hier kannst du den nächsten Match laden.");
    }

    function handleReaction() {
        Alert.alert("Reaction", "Emoji Picker oder Quick Reaction öffnen.");
    }

    function handleIcebreaker() {
        Alert.alert(
            "Icebreaker",
            "Hier kannst du Tipps oder einen kurzen Gesprächsstarter anzeigen.",
        );
    }

    useEffect(() => {
        connectMatchmakingGateway().catch((error) => {
            console.error("connectMatchmakingGateway error", error);
        });

        return () => {
            matchmakingSocketRef.current?.disconnect();
            matchmakingSocketRef.current = null;

            stopCall().catch(() => undefined);
        };
    }, []);

    if (!started) {
        return (
            <SafeAreaView style={styles.startContainer}>
                <Text style={styles.gatewayStatus}>
                    Matchmaking socket: {matchmakingReady ? "connected" : "disconnected"}
                </Text>
                <Text style={styles.gatewayStatus}>Match state: {matchState}</Text>

                {matchedUserId && (
                    <Text style={styles.gatewayStatus}>
                        Matched user: {matchedUserId}
                    </Text>
                )}

                {gatewayRoomId && (
                    <Text style={styles.gatewayStatus}>
                        Gateway room: {gatewayRoomId}
                    </Text>
                )}
                <Text style={styles.startTitle}>Ready for call</Text>
                <Pressable style={styles.startButton} onPress={startCall}>
                    <Text style={styles.startButtonText}>Start video call</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.videoLayer}>
                {remoteUrl ? (
                    <RTCView
                        key={remoteUrl}
                        streamURL={remoteUrl}
                        style={styles.remoteVideo}
                        objectFit="cover"
                        mirror={false}
                    />
                ) : (
                    <View style={[styles.remoteVideo, styles.waitingContainer]}>
                        <Text style={styles.waitingText}>Warte auf Gegenüber...</Text>
                    </View>
                )}

                {localUrl && (
                    <View style={styles.localPreviewWrapper}>
                        <RTCView
                            streamURL={localUrl}
                            style={styles.localPreview}
                            objectFit="cover"
                            mirror={true}
                        />
                    </View>
                )}

                <View style={styles.topBar}>
                    <Pressable style={styles.topButton} onPress={stopCall}>
                        <Ionicons name="chevron-back" size={22} color="#fff" />
                    </Pressable>
                </View>

                <View style={styles.bottomControlsWrapper}>
                    <View style={styles.bottomControls}>
                        <ControlButton
                            onPress={toggleMute}
                            icon={
                                <Feather
                                    name={isMuted ? "mic-off" : "mic"}
                                    size={22}
                                    color="#111"
                                />
                            }
                        />

                        <ControlButton
                            onPress={toggleSpeaker}
                            icon={
                                <Ionicons
                                    name={
                                        isSpeakerOn
                                            ? "volume-high-outline"
                                            : "volume-mute-outline"
                                    }
                                    size={22}
                                    color="#111"
                                />
                            }
                        />

                        <ControlButton
                            onPress={handleLike}
                            variant="success"
                            icon={
                                <Ionicons name="heart-outline" size={22} color="#fff" />
                            }
                        />

                        <ControlButton
                            onPress={handleNextUser}
                            variant="danger"
                            icon={<Ionicons name="close" size={24} color="#fff" />}
                        />

                        <ControlButton
                            onPress={handleReaction}
                            icon={
                                <FontAwesome6
                                    name="face-smile-beam"
                                    size={20}
                                    color="#111"
                                />
                            }
                        />

                        <ControlButton
                            onPress={handleIcebreaker}
                            icon={
                                <MaterialCommunityIcons
                                    name="magic-staff"
                                    size={22}
                                    color="#111"
                                />
                            }
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

function ControlButton({
    onPress,
    icon,
    variant = "default",
}: {
    onPress: () => void;
    icon: React.ReactNode;
    variant?: "default" | "success" | "danger";
}) {
    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.controlButton,
                variant === "success" && styles.controlButtonSuccess,
                variant === "danger" && styles.controlButtonDanger,
            ]}
        >
            {icon}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    videoLayer: {
        flex: 1,
        position: "relative",
        backgroundColor: "#000",
    },
    remoteVideo: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#111",
    },
    waitingContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    waitingText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    localPreviewWrapper: {
        position: "absolute",
        right: 16,
        bottom: 128,
        width: 94,
        height: 154,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#222",
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.18)",
    },
    localPreview: {
        width: "100%",
        height: "100%",
        backgroundColor: "#222",
    },
    topBar: {
        position: "absolute",
        top: 10,
        left: 12,
        right: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    topButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "rgba(0,0,0,0.35)",
        alignItems: "center",
        justifyContent: "center",
    },
    bottomControlsWrapper: {
        position: "absolute",
        left: 10,
        right: 10,
        bottom: 16,
    },
    bottomControls: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "rgba(255,255,255,0.92)",
        borderRadius: 24,
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    controlButton: {
        width: 54,
        height: 54,
        borderRadius: 18,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#d7d7d7",
    },
    controlButtonSuccess: {
        backgroundColor: "#45c466",
        borderColor: "#45c466",
    },
    controlButtonDanger: {
        backgroundColor: "#df1d1d",
        borderColor: "#df1d1d",
    },
    startContainer: {
        flex: 1,
        backgroundColor: "#0b0b0b",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    startTitle: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 16,
    },
    startButton: {
        backgroundColor: "#fff",
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 14,
    },
    startButtonText: {
        color: "#111",
        fontSize: 16,
        fontWeight: "700",
    },
    gatewayStatus: {
        color: "#cfcfcf",
        fontSize: 14,
        marginBottom: 6,
    },
});
