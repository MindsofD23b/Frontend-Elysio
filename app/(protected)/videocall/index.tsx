import { useRef, useState, useEffect, useCallback } from "react";
import { Alert, Animated, Easing, PanResponder } from "react-native";
import { registerGlobals, mediaDevices, MediaStream } from "react-native-webrtc";
import * as mediasoupClient from "mediasoup-client";
import { io, Socket } from "socket.io-client";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useSafeAreaControl } from "@/components/SafeArea";
import { useNavigation } from "expo-router";
import { get, store } from "@/utils/store";
import { SetupScreen } from "@/app/(protected)/videocall/(pages)/SetupScreen";
import { ConnectingScreen } from "@/app/(protected)/videocall/(pages)/ConnectingScreen";
import { CallScreen, ICEBREAKERS } from "@/app/(protected)/videocall/(pages)/CallScreen";
import StreakCelebrationScreen from "@/components/StreakCelebrationModal";

registerGlobals();

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "https://elysio.jamiepoeffel.ch";

type AppScreen = "setup" | "connecting" | "call" | "streak";

export default function VideoCall() {
    const { setDisableSafeArea } = useSafeAreaControl();

    useEffect(() => {
        setDisableSafeArea(true);
        return () => {
            setDisableSafeArea(false);
        };
    });

    const [icebreakerLoading, setIcebreakerLoading] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const controlsOpacity = useRef(new Animated.Value(1)).current;
    const [icebreakerIndex, setIcebreakerIndex] = useState(() =>
        Math.floor(Math.random() * ICEBREAKERS.length),
    );
    const [icebreakerVisible, setIcebreakerVisible] = useState(false);
    const icebreakerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const icebreakerOpacity = useRef(new Animated.Value(0)).current;
    const { token } = useAuth();

    const [screen, setScreen] = useState<AppScreen>("setup");
    const [streakCount, setStreakCount] = useState(1);
    const [localUrl, setLocalUrl] = useState<string | null>(null);
    const [remoteUrl, setRemoteUrl] = useState<string | null>(null);
    const roomIdRef = useRef<string | null>(null);

    const [isMuted, setIsMuted] = useState(false);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

    const peerIdRef = useRef(`peer-${Math.random().toString(36).slice(2, 10)}`);
    const deviceRef = useRef<any>(null);
    const sendTransportRef = useRef<any>(null);
    const recvTransportRef = useRef<any>(null);
    const socketRef = useRef<Socket | null>(null);
    const previewBottomAnim = useRef(new Animated.Value(128)).current;

    const localStreamRef = useRef<any>(null);
    const remoteStreamRef = useRef<any>(new MediaStream());

    const consumedProducerIdsRef = useRef<Set<string>>(new Set());
    const startingRef = useRef(false);
    const consumingProducerIdsRef = useRef<Set<string>>(new Set());
    const consumersRef = useRef<Map<string, any>>(new Map());
    const remoteVideoStreamRef = useRef<any>(null);
    const videoProducerRef = useRef<any>(null);
    const localPreviewPos = useRef({ x: 0, y: 0 });
    const localPreviewAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                localPreviewAnim.setOffset({
                    x: localPreviewPos.current.x,
                    y: localPreviewPos.current.y,
                });
                localPreviewAnim.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event(
                [null, { dx: localPreviewAnim.x, dy: localPreviewAnim.y }],
                { useNativeDriver: false },
            ),
            onPanResponderRelease: () => {
                localPreviewAnim.flattenOffset();
                localPreviewPos.current = {
                    x: (localPreviewAnim.x as any)._value,
                    y: (localPreviewAnim.y as any)._value,
                };
            },
        }),
    ).current;

    const [matchmakingReady, setMatchmakingReady] = useState(false);
    const [matchState, setMatchState] = useState<"idle" | "waiting" | "matched">("idle");
    const [_matchedUserId, setMatchedUserId] = useState<string | null>(null);
    const [gatewayRoomId, setGatewayRoomId] = useState<string | null>(null);

    const matchmakingSocketRef = useRef<Socket | null>(null);
    const stopTracksRef = useRef<() => void>(() => {});
    const connectingIntentRef = useRef(false);

    const [, , , _activateMatchmakingRequest] = useAuthFetch<{
        type: "waiting" | "matched";
        matchedUserId?: string;
        roomId?: string;
    }>("/matchmaking/activate", { method: "POST" }, { manual: true, useCache: false });

    const activateMatchmakingRef = useRef(_activateMatchmakingRequest);
    useEffect(() => {
        activateMatchmakingRef.current = _activateMatchmakingRequest;
    }, [_activateMatchmakingRequest]);

    const [, , , _deactivateMatchmakingRequest] = useAuthFetch<void>(
        "/matchmaking/deactivate",
        { method: "POST" },
        { manual: true, useCache: false },
    );

    const deactivateMatchmakingRef = useRef(_deactivateMatchmakingRequest);
    useEffect(() => {
        deactivateMatchmakingRef.current = _deactivateMatchmakingRequest;
    }, [_deactivateMatchmakingRequest]);

    const api = useCallback(
        async (path: string, options?: RequestInit) => {
            if (!token) throw new Error("Unauthorized");
            const url = `${BASE_URL}${path}`;
            const res = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    ...options?.headers,
                },
                ...options,
            });
            const text = await res.text();
            if (!res.ok) throw new Error(`${res.status} ${text}`);
            return text ? JSON.parse(text) : {};
        },
        [token],
    );

    const connectMatchmakingGateway = useCallback(async () => {
        if (!token) return;
        if (matchmakingSocketRef.current?.connected) return;

        const socket = io(BASE_URL, {
            auth: { token },
            transports: ["websocket"],
            forceNew: true,
        });

        matchmakingSocketRef.current = socket;

        socket.on("connect", () => console.log("Matchmaking socket connected"));
        socket.on("connect_error", (err) =>
            console.log("Matchmaking connect_error:", err.message),
        );
        socket.on("disconnect", () => setMatchmakingReady(false));
        socket.on("socket_ready", () => setMatchmakingReady(true));
        socket.on("queue_waiting", () => setMatchState("waiting"));
        socket.on("match_found", (payload: { matchedUserId: string; roomId: string }) => {
            setMatchState("matched");
            setMatchedUserId(payload.matchedUserId);
            setGatewayRoomId(payload.roomId);
            updateRoomId(payload.roomId);
        });
        socket.on("room_ready", (payload: { roomId: string }) => {
            setGatewayRoomId(payload.roomId);
            updateRoomId(payload.roomId);
        });
    }, [token]);

    const consumeProducer = useCallback(
        async (producerId: string) => {
            const recvTransport = recvTransportRef.current;
            const device = deviceRef.current;
            if (!recvTransport || !device) return;
            if (consumedProducerIdsRef.current.has(producerId)) return;
            if (consumingProducerIdsRef.current.has(producerId)) return;

            consumingProducerIdsRef.current.add(producerId);
            const currentRoomId = getRoomIdOrThrow();

            try {
                const consumerData = await api(
                    `/video/room/${currentRoomId}/transport/${recvTransport.id}/consume`,
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

                await api(`/video/room/${currentRoomId}/consumer/${consumer.id}/resume`, {
                    method: "POST",
                    body: JSON.stringify({ peerId: peerIdRef.current }),
                });

                consumer.track.enabled = true;

                if (consumer.kind === "video") {
                    const videoStream = new MediaStream([consumer.track]);
                    remoteVideoStreamRef.current = videoStream;
                    setTimeout(() => setRemoteUrl(videoStream.toURL()), 300);
                }

                consumingProducerIdsRef.current.delete(producerId);
            } catch (err) {
                consumingProducerIdsRef.current.delete(producerId);
                console.error("consumeProducer error", err);
            }
        },
        [api],
    );

    const createRecvTransport = useCallback(
        async (device: any) => {
            const currentRoomId = getRoomIdOrThrow();
            const transportInfo = await api(`/video/room/${currentRoomId}/transport`, {
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
                        const roomId = getRoomIdOrThrow();
                        await api(
                            `/video/room/${roomId}/transport/${recvTransport.id}/connect`,
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
        },
        [api],
    );

    const createSendTransportAndProduce = useCallback(
        async (device: any, localStream: any) => {
            const currentRoomId = getRoomIdOrThrow();
            const transportInfo = await api(`/video/room/${currentRoomId}/transport`, {
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
                        const currentRoomId = getRoomIdOrThrow();
                        await api(
                            `/video/room/${currentRoomId}/transport/${sendTransport.id}/connect`,
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
                            `/video/room/${currentRoomId}/transport/${sendTransport.id}/produce`,
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
            if (videoTrack) {
                const producer = await sendTransport.produce({ track: videoTrack });
                videoProducerRef.current = producer;
            }
            if (videoTrack) {
                const producer = await sendTransport.produce({ track: videoTrack });
                videoProducerRef.current = producer;
            }
        },
        [api],
    );

    const consumeExistingProducers = useCallback(async () => {
        const currentRoomId = getRoomIdOrThrow();
        const producers = await api(
            `/video/room/${currentRoomId}/producers?peerId=${peerIdRef.current}`,
            { method: "GET" },
        );
        for (const producer of producers) {
            if (producer.peerId === peerIdRef.current) continue;
            await consumeProducer(producer.producerId);
        }
    }, [api, consumeProducer]);

    const startCall = useCallback(async () => {
        if (startingRef.current || screen === "call") return;
        const currentRoomId = roomIdRef.current;
        if (!currentRoomId) return;
        startingRef.current = true;

        try {
            const localStream = await mediaDevices.getUserMedia({
                audio: true,
                video: { frameRate: 30, facingMode: "user" },
            });

            localStreamRef.current = localStream;
            setLocalUrl(localStream.toURL());

            const joinData = await api(`/video/room/${currentRoomId}/join`, {
                method: "POST",
                body: JSON.stringify({ peerId: peerIdRef.current }),
            });

            const device = new mediasoupClient.Device();
            await device.load({ routerRtpCapabilities: joinData.rtpCapabilities });
            deviceRef.current = device;

            await createRecvTransport(device);

            const socket: Socket = io(BASE_URL, {
                query: { peerId: peerIdRef.current, roomId: currentRoomId },
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

            await new Promise<void>((resolve) => {
                if (socket.connected) resolve();
                else socket.once("connect", () => resolve());
            });

            await createSendTransportAndProduce(device, localStream);
            await consumeExistingProducers();
            setTimeout(() => consumeExistingProducers().catch(console.error), 2000);

            setScreen("call");
        } catch (error) {
            console.error("startCall error", error);
            startingRef.current = false;
        }
    }, [
        screen,
        api,
        consumeProducer,
        createRecvTransport,
        createSendTransportAndProduce,
        consumeExistingProducers,
    ]);

    const activateMatchmaking = useCallback(async () => {
        try {
            const data = await activateMatchmakingRef.current();
            if (data.type === "waiting") setMatchState("waiting");
            if (data.type === "matched") {
                setMatchState("matched");
                setMatchedUserId(data.matchedUserId ?? null);
                if (data.roomId) {
                    setGatewayRoomId(data.roomId);
                    updateRoomId(data.roomId);
                }
            }
        } catch (error) {
            console.error("activateMatchmaking error", error);
        }
    }, []);

    const stopCall = useCallback(
        async (callCompleted = false) => {
            localStreamRef.current?.getTracks()?.forEach((t: any) => t.stop());
            localStreamRef.current = null;
            startingRef.current = false;
            connectingIntentRef.current = false;
            icebreakerTimeoutRef.current && clearTimeout(icebreakerTimeoutRef.current);
            setIcebreakerVisible(false);
            icebreakerOpacity.setValue(0);
            icebreakerTimeoutRef.current && clearTimeout(icebreakerTimeoutRef.current);
            setIcebreakerVisible(false);
            icebreakerOpacity.setValue(0);
            socketRef.current?.disconnect();
            socketRef.current = null;

            const currentRoomId = roomIdRef.current;
            if (currentRoomId) {
                try {
                    await api(`/video/room/${currentRoomId}/leave`, {
                        method: "DELETE",
                        body: JSON.stringify({ peerId: peerIdRef.current }),
                    });
                } catch {}
            }

            try {
                await deactivateMatchmakingRef.current();
            } catch {}

            sendTransportRef.current?.close();
            recvTransportRef.current?.close();
            sendTransportRef.current = null;
            recvTransportRef.current = null;
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
            setGatewayRoomId(null);
            setMatchedUserId(null);
            setMatchState("idle");
            setMatchmakingReady(false);
            roomIdRef.current = null;

            matchmakingSocketRef.current?.disconnect();
            matchmakingSocketRef.current = null;

            // only show streak screen after a real call, once per day
            const today = new Date().toISOString().slice(0, 10);
            const lastShown = await get<string>("streak_modal_last_shown");
            if (callCompleted && lastShown !== today) {
                try {
                    const data = await api("/users/streak");
                    setStreakCount(data?.streak ?? 1);
                } catch {
                    setStreakCount(1);
                }
                await store("streak_modal_last_shown", today);
                setScreen("streak");
            } else {
                setScreen("setup");
            }
        },
        [api],
    );

    const handleStartConnecting = useCallback(
        async (_camera: string, _mic: string, _interests: string[]) => {
            connectingIntentRef.current = true;
            setScreen("connecting");
            await connectMatchmakingGateway();
        },
        [connectMatchmakingGateway],
    );

    function toggleMute() {
        const stream = localStreamRef.current;
        if (!stream) return;
        const nextMuted = !isMuted;
        stream
            .getAudioTracks()
            .forEach((track: MediaStreamTrack) => (track.enabled = !nextMuted));
        setIsMuted(nextMuted);
    }

    const isAnimatingRef = useRef(false);
    function toggleControls() {
        if (isAnimatingRef.current) return;
        isAnimatingRef.current = true;
        const toValue = controlsVisible ? 0 : 1;
        const toBottom = controlsVisible ? 24 : 128;
        Animated.parallel([
            Animated.timing(controlsOpacity, {
                toValue,
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(previewBottomAnim, {
                toValue: toBottom,
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: false,
            }),
        ]).start(() => {
            setControlsVisible((v) => !v);
            isAnimatingRef.current = false;
        });
    }

    async function flipCamera() {
        const nextFacing = facingMode === "user" ? "environment" : "user";
        const stream = localStreamRef.current;
        if (!stream) return;

        stream.getVideoTracks().forEach((t: any) => t.stop());
        setLocalUrl(null);

        try {
            const newStream = await mediaDevices.getUserMedia({
                audio: false,
                video: { frameRate: 30, facingMode: nextFacing },
            });

            const newVideoTrack = newStream.getVideoTracks()[0];
            if (!newVideoTrack) return;

            if (videoProducerRef.current) {
                await videoProducerRef.current.replaceTrack({ track: newVideoTrack });
            }

            localStreamRef.current = newStream;
            setFacingMode(nextFacing);
            setLocalUrl(newStream.toURL());
        } catch (err) {
            console.error("flipCamera error", err);
            setFacingMode(facingMode);
        }
    }

    function updateRoomId(nextRoomId: string) {
        roomIdRef.current = nextRoomId;
    }

    function getRoomIdOrThrow(): string {
        const currentRoomId = roomIdRef.current;
        if (!currentRoomId) throw new Error("Room ID is missing");
        return currentRoomId;
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
        if (icebreakerTimeoutRef.current) clearTimeout(icebreakerTimeoutRef.current);

        if (icebreakerVisible && !icebreakerLoading) {
            setIcebreakerVisible(false);
            setIcebreakerLoading(false);
            icebreakerOpacity.setValue(0);
            return;
        }

        icebreakerOpacity.setValue(1);
        setIcebreakerLoading(true);
        setIcebreakerVisible(true);

        setIcebreakerIndex((prev) => {
            let next;
            do {
                next = Math.floor(Math.random() * ICEBREAKERS.length);
            } while (next === prev && ICEBREAKERS.length > 1);
            return next;
        });

        icebreakerTimeoutRef.current = setTimeout(
            () => setIcebreakerLoading(false),
            1500,
        );
    }

    useEffect(() => {
        if (!matchmakingReady) return;
        if (!connectingIntentRef.current) return;
        activateMatchmaking().catch(console.error);
    }, [matchmakingReady, activateMatchmaking]);

    useEffect(() => {
        if (!gatewayRoomId) return;
        if (screen === "call" || startingRef.current) return;
        startCall().catch(console.error);
    }, [gatewayRoomId, screen, startCall]);

    useEffect(() => {
        stopTracksRef.current = () => {
            localStreamRef.current?.getTracks()?.forEach((t: any) => t.stop());
        };
    });

    useEffect(() => {
        return () => {
            stopTracksRef.current();
            matchmakingSocketRef.current?.disconnect();
            socketRef.current?.disconnect();
            sendTransportRef.current?.close();
            recvTransportRef.current?.close();
            const consumers = consumersRef.current;
            consumers.forEach((c) => {
                try {
                    c.close();
                } catch {}
            });
            consumers.clear();
            consumedProducerIdsRef.current.clear();
            consumingProducerIdsRef.current.clear();
        };
    }, []);

    if (screen === "streak") {
        return (
            <StreakCelebrationScreen
                streak={streakCount}
                onDismiss={() => setScreen("setup")}
            />
        );
    }

    if (screen === "setup") {
        return (
            <SetupScreen
                onConnect={handleStartConnecting}
                onTestStreak={() => {
                    setStreakCount(1047);
                    setScreen("streak");
                }}
            />
        );
    }

    if (screen === "connecting") {
        return <ConnectingScreen matchState={matchState} onCancel={stopCall} />;
    }

    return (
        <CallScreen
            remoteUrl={remoteUrl}
            localUrl={localUrl}
            isMuted={isMuted}
            facingMode={facingMode}
            controlsVisible={controlsVisible}
            controlsOpacity={controlsOpacity}
            previewBottomAnim={previewBottomAnim}
            localPreviewAnim={localPreviewAnim}
            panHandlers={panResponder.panHandlers}
            icebreakerVisible={icebreakerVisible}
            icebreakerLoading={icebreakerLoading}
            icebreakerIndex={icebreakerIndex}
            icebreakerOpacity={icebreakerOpacity}
            onToggleControls={toggleControls}
            onToggleMute={toggleMute}
            onFlipCamera={flipCamera}
            onStop={() => stopCall(true)}
            onLike={handleLike}
            onNextUser={handleNextUser}
            onReaction={handleReaction}
            onIcebreaker={handleIcebreaker}
        />
    );
}
