import { useRef, useState, useEffect, useCallback } from "react";
import { Alert, Animated, Easing, PanResponder, View } from "react-native";
import { registerGlobals, mediaDevices, MediaStream } from "react-native-webrtc";
import * as mediasoupClient from "mediasoup-client";
import { io, Socket } from "socket.io-client";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useSafeAreaControl } from "@/components/SafeArea";
import { get, store } from "@/utils/store";
import { SetupScreen } from "@/app/(protected)/videocall/(pages)/SetupScreen";
import { ConnectingScreen } from "@/app/(protected)/videocall/(pages)/ConnectingScreen";
import { CallScreen, ICEBREAKERS } from "@/app/(protected)/videocall/(pages)/CallScreen";
import StreakCelebrationScreen from "@/components/StreakCelebrationModal";
import { DebugFAB } from "@/components/debug/DebugFAB";
import {
    useDebugLog,
    useDebugSection,
    useDebugActions,
} from "@/components/debug/DebugContext";
import { router } from "expo-router";
import { useDebugEnabled } from "@/utils/debugState";

registerGlobals();

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "https://elysio.jamiepoeffel.ch";
const TTL_MS = 3600 * 1000;
const REFRESH_AT = TTL_MS * 0.8;

type AppScreen = "setup" | "connecting" | "call" | "streak";

export default function VideoCall() {
    const { setDisableSafeArea } = useSafeAreaControl();
    const IS_DEV = useDebugEnabled();

    useEffect(() => {
        setDisableSafeArea(true);
        return () => {
            setDisableSafeArea(false);
        };
    });

    const [debugTick, setDebugTick] = useState(0);
    const _rawLog = useDebugLog("VideoCall");
    const log = useCallback(
        (msg: string) => {
            if (!IS_DEV) return;
            _rawLog(msg);
            setDebugTick((t) => t + 1);
        },
        [_rawLog],
    );
    const [reactionPickerVisible, setReactionPickerVisible] = useState(false);
    const [floatingReactions, setFloatingReactions] = useState<
        { id: string; emoji: string; startX: number }[]
    >([]);
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

    const iceRefreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const iceServersRef = useRef<any[]>([]);
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

    const [isLiked, setIsLiked] = useState(false);
    const [receivedLike, setReceivedLike] = useState(false);
    const [mutualLike, setMutualLike] = useState(false);
    const chatRoomIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (!receivedLike) return;
        const t = setTimeout(() => setReceivedLike(false), 5000);
        return () => clearTimeout(t);
    }, [receivedLike]);

    useEffect(() => {
        if (!mutualLike) return;
        const t = setTimeout(() => setMutualLike(false), 4000);
        return () => clearTimeout(t);
    }, [mutualLike]);

    const matchmakingSocketRef = useRef<Socket | null>(null);
    const stopTracksRef = useRef<() => void>(() => {});
    const connectingIntentRef = useRef(false);
    const selectedCameraRef = useRef<string>("");
    const selectedMicRef = useRef<string>("");
    const selectedOutputRef = useRef<string>("");

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
            // [DEBUG]
            log(`[API] ${options?.method ?? "GET"} ${path}`);
            const res = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    ...options?.headers,
                },
                ...options,
            });
            const text = await res.text();
            if (!res.ok) {
                log(`[API] ❌ ${res.status} ${path}`);
                throw new Error(`${res.status} ${text}`);
            }
            log(`[API] ✅ ${res.status} ${path}`);
            return text ? JSON.parse(text) : {};
        },
        [token, log],
    );

    const refreshIceCredentials = useCallback(async () => {
        try {
            log("[ICE] Refreshing credentials…");
            const { iceServers } = await api("/video/turn-credentials");

            iceServersRef.current = iceServers;
            log(`[ICE] Got ${iceServers.length} server(s)`);

            if (sendTransportRef.current) await sendTransportRef.current.restartIce();
            if (recvTransportRef.current) await recvTransportRef.current.restartIce();

            iceRefreshTimerRef.current = setTimeout(refreshIceCredentials, REFRESH_AT);
        } catch (err) {
            log(`[ICE] ❌ refreshIceCredentials: ${err}`);
            console.error("refreshIceCredentials error", err);
        }
    }, [api, log]);

    const connectMatchmakingGateway = useCallback(async () => {
        if (!token) return;
        if (matchmakingSocketRef.current?.connected) return;

        log("[MM] Connecting matchmaking socket…");
        const socket = io(BASE_URL, {
            auth: { token },
            transports: ["websocket"],
            forceNew: true,
        });

        matchmakingSocketRef.current = socket;

        socket.on("connect", () => {
            log(`[MM] Socket connected: ${socket.id}`);
            console.log("Matchmaking socket connected");
        });
        socket.on("connect_error", (err) => {
            log(`[MM] connect_error: ${err.message}`);
            console.log("Matchmaking connect_error:", err.message);
        });
        socket.on("disconnect", () => {
            log("[MM] Socket disconnected");
            setMatchmakingReady(false);
        });
        socket.on("socket_ready", () => {
            log("[MM] socket_ready");
            setMatchmakingReady(true);
        });
        socket.on("queue_waiting", () => {
            log("[MM] queue_waiting");
            setMatchState("waiting");
        });
        socket.on("match_found", (payload: { matchedUserId: string; roomId: string }) => {
            log(`[MM] match_found roomId=${payload.roomId}`);
            setMatchState("matched");
            setMatchedUserId(payload.matchedUserId);
            setGatewayRoomId(payload.roomId);
            updateRoomId(payload.roomId);
        });
        socket.on("room_ready", (payload: { roomId: string }) => {
            log(`[MM] room_ready roomId=${payload.roomId}`);
            setGatewayRoomId(payload.roomId);
            updateRoomId(payload.roomId);
        });
    }, [token, log]);

    const consumeProducer = useCallback(
        async (producerId: string) => {
            const recvTransport = recvTransportRef.current;
            const device = deviceRef.current;
            if (!recvTransport || !device) return;
            if (consumedProducerIdsRef.current.has(producerId)) return;
            if (consumingProducerIdsRef.current.has(producerId)) return;

            consumingProducerIdsRef.current.add(producerId);
            log(`[WebRTC] consuming producerId=${producerId.slice(0, 8)}…`);
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
                    log(`[WebRTC] ✅ remote video consumer ready`);
                    const videoStream = new MediaStream([consumer.track]);
                    remoteVideoStreamRef.current = videoStream;
                    setTimeout(() => setRemoteUrl(videoStream.toURL()), 300);
                }

                consumingProducerIdsRef.current.delete(producerId);
            } catch (err) {
                consumingProducerIdsRef.current.delete(producerId);
                log(`[WebRTC] ❌ consumeProducer: ${err}`);
                console.error("consumeProducer error", err);
            }
        },
        [api, log],
    );

    const createRecvTransport = useCallback(
        async (device: any) => {
            log("[WebRTC] createRecvTransport…");
            const currentRoomId = getRoomIdOrThrow();
            const transportInfo = await api(`/video/room/${currentRoomId}/transport`, {
                method: "POST",
                body: JSON.stringify({ peerId: peerIdRef.current }),
            });

            const recvTransport = device.createRecvTransport({
                ...transportInfo,
                iceServers: iceServersRef.current,
            });

            recvTransportRef.current = recvTransport;
            log(`[WebRTC] recvTransport created id=${recvTransport.id?.slice(0, 8)}…`);

            recvTransport.on(
                "connect",
                async ({ dtlsParameters }: any, callback: any, errback: any) => {
                    try {
                        log("[WebRTC] recvTransport connect event");
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
                        log(`[WebRTC] ❌ recvTransport connect: ${err}`);
                        errback(err);
                    }
                },
            );
        },
        [api, log],
    );

    const createSendTransportAndProduce = useCallback(
        async (device: any, localStream: any) => {
            log("[WebRTC] createSendTransportAndProduce…");
            const currentRoomId = getRoomIdOrThrow();
            const transportInfo = await api(`/video/room/${currentRoomId}/transport`, {
                method: "POST",
                body: JSON.stringify({ peerId: peerIdRef.current }),
            });

            const sendTransport = device.createSendTransport({
                ...transportInfo,
                iceServers: iceServersRef.current,
            });

            sendTransportRef.current = sendTransport;
            log(`[WebRTC] sendTransport created id=${sendTransport.id?.slice(0, 8)}…`);

            sendTransport.on(
                "connect",
                async ({ dtlsParameters }: any, callback: any, errback: any) => {
                    try {
                        log("[WebRTC] sendTransport connect event");
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
                        log(`[WebRTC] ❌ sendTransport connect: ${err}`);
                        errback(err);
                    }
                },
            );

            sendTransport.on(
                "produce",
                async ({ kind, rtpParameters }: any, callback: any, errback: any) => {
                    try {
                        log(`[WebRTC] produce kind=${kind}`);
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
                        log(`[WebRTC] ❌ produce: ${err}`);
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
            log("[WebRTC] ✅ producing audio + video");
            if (videoTrack) {
                const producer = await sendTransport.produce({ track: videoTrack });
                videoProducerRef.current = producer;
            }
        },
        [api, log],
    );

    const consumeExistingProducers = useCallback(async () => {
        const currentRoomId = getRoomIdOrThrow();
        const producers = await api(
            `/video/room/${currentRoomId}/producers?peerId=${peerIdRef.current}`,
            { method: "GET" },
        );
        log(`[WebRTC] consumeExisting: ${producers.length} producer(s)`);
        for (const producer of producers) {
            if (producer.peerId === peerIdRef.current) continue;
            await consumeProducer(producer.producerId);
        }
    }, [api, consumeProducer, log]);

    const startCall = useCallback(async () => {
        if (startingRef.current || screen === "call") return;
        const currentRoomId = roomIdRef.current;
        if (!currentRoomId) return;
        startingRef.current = true;
        log("[Call] startCall…");

        try {
            const localStream = await mediaDevices.getUserMedia({
                audio: selectedMicRef.current
                    ? { deviceId: { exact: selectedMicRef.current } }
                    : true,
                video: selectedCameraRef.current
                    ? { deviceId: { exact: selectedCameraRef.current }, frameRate: 30 }
                    : { frameRate: 30, facingMode: "user" },
            });

            localStreamRef.current = localStream;
            setLocalUrl(localStream.toURL());
            log("[Call] getUserMedia ✅");

            const joinData = await api(`/video/room/${currentRoomId}/join`, {
                method: "POST",
                body: JSON.stringify({ peerId: peerIdRef.current }),
            });

            iceServersRef.current = joinData.iceServers;
            log(`[Call] joined room, ${joinData.iceServers?.length ?? 0} ICE server(s)`);
            const device = new mediasoupClient.Device();
            await device.load({ routerRtpCapabilities: joinData.rtpCapabilities });
            deviceRef.current = device;
            log("[Call] mediasoup Device loaded ✅");

            await createRecvTransport(device);

            const socket: Socket = io(BASE_URL, {
                auth: { token },
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
                    log(`[Call] new-producer from peerId=${peerId.slice(0, 8)}…`);
                    if (peerId === peerIdRef.current) return;
                    await consumeProducer(producerId);
                },
            );

            socket.on("receive_like", () => {
                setReceivedLike(true);
            });

            socket.on("mutual_like", ({ chatRoomId: id }: { chatRoomId: string }) => {
                setMutualLike(true);
                setReceivedLike(false);
                chatRoomIdRef.current = id;
            });

            socket.on("peer_left", () => {
                handleNextUserRef.current();
            });
            socket.on("receive_reaction", ({ emoji }: { emoji: string }) => {
                const id = Math.random().toString(36).slice(2);
                const startX = Math.floor(Math.random() * 300) + 20;
                setFloatingReactions((prev) => [...prev, { id, emoji, startX }]);
                setTimeout(() => {
                    setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
                }, 2500);
            });
            await new Promise<void>((resolve) => {
                if (socket.connected) resolve();
                else socket.once("connect", () => resolve());
            });
            log(`[Call] call socket connected id=${socket.id}`);

            await createSendTransportAndProduce(device, localStream);
            await consumeExistingProducers();
            setTimeout(() => consumeExistingProducers().catch(console.error), 2000);

            iceRefreshTimerRef.current = setTimeout(refreshIceCredentials, REFRESH_AT);
            log("[Call] ✅ call started");
            setScreen("call");
        } catch (error) {
            log(`[Call] ❌ startCall error: ${error}`);
            console.error("startCall error", error);
            startingRef.current = false;
        }
    }, [
        screen,
        token,
        api,
        consumeProducer,
        createRecvTransport,
        createSendTransportAndProduce,
        consumeExistingProducers,
        log,
    ]);

    const activateMatchmaking = useCallback(async () => {
        try {
            log("[MM] activateMatchmaking…");
            const data = await activateMatchmakingRef.current();
            log(`[MM] activate response type=${data.type}`);
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
            log(`[MM] ❌ activateMatchmaking: ${error}`);
            console.error("activateMatchmaking error", error);
        }
    }, [log]);

    const stopCall = useCallback(
        async (callCompleted = false) => {
            log(`[Call] stopCall callCompleted=${callCompleted}`);
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
                try {
                    await api("/matchmaking/decline", {
                        method: "POST",
                        body: JSON.stringify({ roomId: currentRoomId }),
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
            setIsLiked(false);
            setReceivedLike(false);
            setMutualLike(false);
            chatRoomIdRef.current = null;
            roomIdRef.current = null;

            matchmakingSocketRef.current?.disconnect();
            matchmakingSocketRef.current = null;
            iceRefreshTimerRef.current && clearTimeout(iceRefreshTimerRef.current);
            iceRefreshTimerRef.current = null;
            log("[Call] cleanup done");

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
        [api, log],
    );

    const stopCallRef = useRef(stopCall);
    useEffect(() => {
        stopCallRef.current = stopCall;
    }, [stopCall]);

    const handleNextUserRef = useRef<() => Promise<void>>(async () => {});
    useEffect(() => {
        handleNextUserRef.current = handleNextUser;
    });

    const handleStartConnecting = useCallback(
        async (camera: string, mic: string, _interests: string[]) => {
            selectedCameraRef.current = camera;
            selectedMicRef.current = mic;
            connectingIntentRef.current = true;
            log("[Nav] → connecting");
            setScreen("connecting");
            await connectMatchmakingGateway();
        },
        [connectMatchmakingGateway, log],
    );

    function toggleMute() {
        const stream = localStreamRef.current;
        if (!stream) return;
        const nextMuted = !isMuted;
        stream
            .getAudioTracks()
            .forEach((track: MediaStreamTrack) => (track.enabled = !nextMuted));
        log(`[Call] mute → ${nextMuted}`);
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
        log(`[Call] flipCamera → ${nextFacing}`);

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
            log(`[Call] flipCamera ✅`);
        } catch (err) {
            log(`[Call] ❌ flipCamera: ${err}`);
            console.error("flipCamera error", err);
            setFacingMode(facingMode);
        }
    }

    function updateRoomId(nextRoomId: string) {
        log(`[Room] roomId → ${nextRoomId}`);
        roomIdRef.current = nextRoomId;
    }

    function getRoomIdOrThrow(): string {
        const currentRoomId = roomIdRef.current;
        if (!currentRoomId) throw new Error("Room ID is missing");
        return currentRoomId;
    }

    function handleLike() {
        if (isLiked) return;
        socketRef.current?.emit("send_like");
        setIsLiked(true);
    }

    function handleLikeBack() {
        console.log("[LikeBack] User liked back in room:", roomIdRef.current);
        socketRef.current?.emit("send_like_back");
    }

    async function handleNextUser() {
        const roomId = roomIdRef.current;

        // Decline current match so these two users won't match again
        if (roomId) {
            try {
                await api("/matchmaking/decline", {
                    method: "POST",
                    body: JSON.stringify({ roomId }),
                });
            } catch {}
        }

        // Clean up video session without touching the matchmaking socket
        localStreamRef.current?.getTracks()?.forEach((t: any) => t.stop());
        localStreamRef.current = null;
        startingRef.current = false;

        if (icebreakerTimeoutRef.current) clearTimeout(icebreakerTimeoutRef.current);
        setIcebreakerVisible(false);
        icebreakerOpacity.setValue(0);

        socketRef.current?.disconnect();
        socketRef.current = null;

        if (roomId) {
            try {
                await api(`/video/room/${roomId}/leave`, {
                    method: "DELETE",
                    body: JSON.stringify({ peerId: peerIdRef.current }),
                });
            } catch {}
        }

        sendTransportRef.current?.close();
        recvTransportRef.current?.close();
        sendTransportRef.current = null;
        recvTransportRef.current = null;
        remoteStreamRef.current = new MediaStream();

        consumersRef.current.forEach((c) => {
            try {
                c.close();
            } catch {}
        });
        consumersRef.current.clear();
        consumedProducerIdsRef.current.clear();
        consumingProducerIdsRef.current.clear();
        remoteVideoStreamRef.current = null;

        iceRefreshTimerRef.current && clearTimeout(iceRefreshTimerRef.current);
        iceRefreshTimerRef.current = null;

        // Generate a fresh peerId for the new call
        peerIdRef.current = `peer-${Math.random().toString(36).slice(2, 10)}`;

        setLocalUrl(null);
        setRemoteUrl(null);
        setGatewayRoomId(null);
        setMatchedUserId(null);
        setMatchState("idle");
        setIsLiked(false);
        setReceivedLike(false);
        setMutualLike(false);
        chatRoomIdRef.current = null;
        roomIdRef.current = null;

        // Re-enter matchmaking — deactivate first to guarantee IDLE state
        setScreen("connecting");
        await connectMatchmakingGateway();
        try {
            await deactivateMatchmakingRef.current();
        } catch {}
        await activateMatchmaking();
    }
    function handleReaction() {
        setReactionPickerVisible((v) => !v);
    }

    function handleSelectReaction(emoji: string) {
        setReactionPickerVisible(false);
        const id = Math.random().toString(36).slice(2);
        const startX = Math.floor(Math.random() * 300) + 20;
        setFloatingReactions((prev) => [...prev, { id, emoji, startX }]);
        setTimeout(() => {
            setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
        }, 2500);
        socketRef.current?.emit("send_reaction", { emoji });
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
            iceRefreshTimerRef.current && clearTimeout(iceRefreshTimerRef.current);
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

    useDebugSection(
        "Matchmaking",
        [
            { label: "screen", value: screen },
            { label: "matchState", value: matchState },
            { label: "matchmakingReady", value: matchmakingReady ? "✅" : "❌" },
            { label: "gatewayRoomId", value: gatewayRoomId ?? "–" },
            { label: "roomId", value: roomIdRef.current ?? "–" },
            {
                label: "mmSocket",
                value: matchmakingSocketRef.current?.connected
                    ? `✅ ${matchmakingSocketRef.current.id?.slice(0, 8)}…`
                    : "❌",
            },
            {
                label: "callSocket",
                value: socketRef.current?.connected
                    ? `✅ ${socketRef.current.id?.slice(0, 8)}…`
                    : "❌",
            },
        ],
        [screen, matchState, matchmakingReady, gatewayRoomId, debugTick],
        0,
    );

    useDebugSection(
        "WebRTC",
        [
            { label: "Device loaded", value: deviceRef.current ? "✅" : "❌" },
            {
                label: "Device codecs",
                value: deviceRef.current
                    ? Object.keys(deviceRef.current.rtpCapabilities?.codecs ?? {})
                          .length + " codecs"
                    : "-",
            },
            {
                label: "sendTransport",
                value: sendTransportRef.current
                    ? `${sendTransportRef.current.id?.slice(0, 8)}… [${sendTransportRef.current.connectionState ?? "?"}]`
                    : "❌",
            },
            {
                label: "recvTransport",
                value: recvTransportRef.current
                    ? `${recvTransportRef.current.id?.slice(0, 8)}… [${recvTransportRef.current.connectionState ?? "?"}]`
                    : "❌",
            },
            { label: "localUrl", value: localUrl ? "✅" : "❌" },
            { label: "remoteUrl", value: remoteUrl ? "✅" : "❌" },
            { label: "Muted", value: isMuted ? "🔇" : "🔊" },
            { label: "Camera", value: facingMode },
            {
                label: "Consumers (active)",
                value: String(consumersRef.current.size),
            },
            {
                label: "Consumers (consuming)",
                value: String(consumingProducerIdsRef.current.size),
            },
            {
                label: "Consumed IDs",
                value: String(consumedProducerIdsRef.current.size),
            },
        ],
        [localUrl, remoteUrl, isMuted, facingMode, debugTick],
        1,
    );

    useDebugSection(
        "ICE / Network",
        [
            { label: "ICE Server count", value: String(iceServersRef.current.length) },
            ...iceServersRef.current.map((srv, i) => ({
                label: `Server ${i + 1}`,
                value: Array.isArray(srv.urls) ? srv.urls[0] : (srv.urls ?? "?"),
            })),
        ],
        [debugTick],
        2,
    );

    useDebugActions(
        [
            ...(["setup", "connecting", "call", "streak"] as AppScreen[]).map((s) => ({
                key: `screen:${s}`,
                label: `→ ${s}`,
                active: screen === s,
                onPress: () => {
                    setScreen(s);
                    router.back();
                },
            })),
            ...[1, 7, 30, 100, 365, 1047].map((n) => ({
                key: `streak:${n}`,
                label: `streak ${n}`,
                active: streakCount === n,
                onPress: () => setStreakCount(n),
            })),
        ],
        [screen, streakCount],
    );

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
            <>
                <SetupScreen
                    onConnect={handleStartConnecting}
                    onTestStreak={() => {
                        setStreakCount(1047);
                        setScreen("streak");
                    }}
                />
                {IS_DEV && <DebugFAB />}
            </>
        );
    }

    if (screen === "connecting") {
        return (
            <>
                <ConnectingScreen matchState={matchState} onCancel={stopCall} />
                {IS_DEV && <DebugFAB />}
            </>
        );
    }

    return (
        <>
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
                isLiked={isLiked}
                receivedLike={receivedLike}
                mutualLike={mutualLike}
                onLikeBack={handleLikeBack}
                reactionPickerVisible={reactionPickerVisible}
                floatingReactions={floatingReactions}
                onSelectReaction={handleSelectReaction}
                onCloseReactionPicker={() => setReactionPickerVisible(false)}
                onToggleControls={toggleControls}
                onToggleMute={toggleMute}
                onFlipCamera={flipCamera}
                onStop={() => stopCall(true)}
                onLike={handleLike}
                onNextUser={handleNextUser}
                onReaction={handleReaction}
                onIcebreaker={handleIcebreaker}
            />
            {IS_DEV && <DebugFAB />}
        </>
    );
}
