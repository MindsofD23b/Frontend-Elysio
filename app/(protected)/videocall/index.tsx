//MADE WITH HELP CLAUDE.AI

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Alert,
    ScrollView,
    Animated,
    Easing,
    PanResponder,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { registerGlobals, mediaDevices, RTCView, MediaStream } from "react-native-webrtc";
import * as mediasoupClient from "mediasoup-client";
import { io, Socket } from "socket.io-client";
import {
    Ionicons,
    MaterialCommunityIcons,
    Feather,
    FontAwesome6,
} from "@expo/vector-icons";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useTheme } from "@/lib/theme/context";

registerGlobals();

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "https://elysio.jamiepoeffel.ch";

// ─── Hardcoded data (replace later) ────────────────────────────────────────

const CAMERAS = [
    { id: "front", label: "Front camera" },
    { id: "back", label: "Back camera" },
];
const MICROPHONES = [
    { id: "default", label: "Built-in microphone" },
    { id: "headset", label: "Headset microphone" },
];

const INTERESTS = [
    "Music",
    "Travel",
    "Gaming",
    "Fitness",
    "Art",
    "Photography",
    "Movies",
    "Cooking",
    "Tech",
    "Books",
    "Hiking",
    "Fashion",
    "Sports",
    "Design",
    "Languages",
];

// ─── Types ──────────────────────────────────────────────────────────────────

type AppScreen = "setup" | "connecting" | "call";

// ─── Loader dot component ────────────────────────────────────────────────────

function PulsingDots() {
    const dot0 = useRef(new Animated.Value(0)).current;
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dots = [dot0, dot1, dot2];

    useEffect(() => {
        const animations = dots.map((dot, i) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(i * 160),
                    Animated.timing(dot, {
                        toValue: 1,
                        duration: 420,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(dot, {
                        toValue: 0,
                        duration: 420,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.delay((dots.length - i - 1) * 160),
                ]),
            ),
        );
        Animated.parallel(animations).start();
        return () => animations.forEach((a) => a.stop());
    }, [dot0, dot1, dot2]);

    return (
        <View style={loaderStyles.dotsRow}>
            {dots.map((dot, i) => (
                <Animated.View
                    key={i}
                    style={[
                        loaderStyles.dot,
                        {
                            transform: [
                                {
                                    scale: dot.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.6, 1.2],
                                    }),
                                },
                            ],
                            opacity: dot.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.3, 1],
                            }),
                        },
                    ]}
                />
            ))}
        </View>
    );
}

// ─── Setup screen ────────────────────────────────────────────────────────────

const makeSetupStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
    StyleSheet.create({
        root: {
            flex: 1,
            backgroundColor: "#0b0b0b",
        },
        scroll: {
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 48,
        },
        header: {
            marginBottom: 36,
        },
        title: {
            color: "#fff",
            fontSize: 28,
            fontWeight: "700",
            letterSpacing: -0.5,
            marginBottom: 6,
        },
        subtitle: {
            color: "#777",
            fontSize: 15,
        },
        section: {
            marginBottom: 28,
        },
        sectionHeader: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginBottom: 12,
        },
        sectionLabel: {
            color: "#bbb",
            fontSize: 13,
            fontWeight: "600",
            letterSpacing: 0.3,
            textTransform: "uppercase",
        },
        sectionLabelMuted: {
            color: "#555",
            fontWeight: "400",
            textTransform: "none",
            fontSize: 12,
        },
        pillRow: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
        },
        pill: {
            paddingHorizontal: 14,
            paddingVertical: 9,
            borderRadius: 10,
            backgroundColor: "#1a1a1a",
            borderWidth: 1,
            borderColor: "#2a2a2a",
        },
        pillActive: {
            backgroundColor: theme.primary,
            borderColor: theme.primary,
        },
        pillText: {
            color: "#888",
            fontSize: 14,
            fontWeight: "500",
        },
        pillTextActive: {
            color: "#fff",
        },
        interestGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
        },
        interestTag: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 13,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: "#1a1a1a",
            borderWidth: 1,
            borderColor: "#2a2a2a",
        },
        interestTagActive: {
            backgroundColor: "#1c1c1c",
            borderColor: theme.primary,
        },
        interestText: {
            color: "#666",
            fontSize: 14,
            fontWeight: "500",
        },
        interestTextActive: {
            color: "#fff",
        },
        cta: {
            marginTop: 16,
            backgroundColor: theme.primary,
            borderRadius: 16,
            paddingVertical: 16,
            paddingHorizontal: 24,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
        },
        ctaText: {
            color: "#fff",
            fontSize: 16,
            fontWeight: "700",
        },
    });

function SetupScreen({
    onConnect,
}: {
    onConnect: (camera: string, mic: string, interests: string[]) => void;
}) {
    const [selectedCamera, setSelectedCamera] = useState(CAMERAS[0].id);
    const [selectedMic, setSelectedMic] = useState(MICROPHONES[0].id);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const { theme } = useTheme();
    const setupStyles = useMemo(() => makeSetupStyles(theme), [theme]);

    function toggleInterest(interest: string) {
        setSelectedInterests((prev) =>
            prev.includes(interest)
                ? prev.filter((i) => i !== interest)
                : [...prev, interest],
        );
    }

    return (
        <SafeAreaView style={setupStyles.root}>
            <ScrollView
                contentContainerStyle={setupStyles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={setupStyles.header}>
                    <Text style={setupStyles.title}>Ready to connect?</Text>
                    <Text style={setupStyles.subtitle}>
                        Set up your devices and pick your interests
                    </Text>
                </View>

                {/* Camera */}
                <View style={setupStyles.section}>
                    <View style={setupStyles.sectionHeader}>
                        <Ionicons name="videocam-outline" size={16} color="#888" />
                        <Text style={setupStyles.sectionLabel}>Camera</Text>
                    </View>
                    <View style={setupStyles.pillRow}>
                        {CAMERAS.map((cam) => (
                            <Pressable
                                key={cam.id}
                                style={[
                                    setupStyles.pill,
                                    selectedCamera === cam.id && setupStyles.pillActive,
                                ]}
                                onPress={() => setSelectedCamera(cam.id)}
                            >
                                <Text
                                    style={[
                                        setupStyles.pillText,
                                        selectedCamera === cam.id &&
                                            setupStyles.pillTextActive,
                                    ]}
                                >
                                    {cam.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Microphone */}
                <View style={setupStyles.section}>
                    <View style={setupStyles.sectionHeader}>
                        <Feather name="mic" size={15} color="#888" />
                        <Text style={setupStyles.sectionLabel}>Microphone</Text>
                    </View>
                    <View style={setupStyles.pillRow}>
                        {MICROPHONES.map((mic) => (
                            <Pressable
                                key={mic.id}
                                style={[
                                    setupStyles.pill,
                                    selectedMic === mic.id && setupStyles.pillActive,
                                ]}
                                onPress={() => setSelectedMic(mic.id)}
                            >
                                <Text
                                    style={[
                                        setupStyles.pillText,
                                        selectedMic === mic.id &&
                                            setupStyles.pillTextActive,
                                    ]}
                                >
                                    {mic.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Interests */}
                <View style={setupStyles.section}>
                    <View style={setupStyles.sectionHeader}>
                        <Ionicons name="sparkles-outline" size={16} color="#888" />
                        <Text style={setupStyles.sectionLabel}>
                            Interests{" "}
                            <Text style={setupStyles.sectionLabelMuted}>
                                · match with people like you
                            </Text>
                        </Text>
                    </View>
                    <View style={setupStyles.interestGrid}>
                        {INTERESTS.map((interest) => {
                            const active = selectedInterests.includes(interest);
                            return (
                                <Pressable
                                    key={interest}
                                    style={[
                                        setupStyles.interestTag,
                                        active && setupStyles.interestTagActive,
                                    ]}
                                    onPress={() => toggleInterest(interest)}
                                >
                                    {active && (
                                        <Ionicons
                                            name="checkmark"
                                            size={12}
                                            color="#fff"
                                            style={{ marginRight: 4 }}
                                        />
                                    )}
                                    <Text
                                        style={[
                                            setupStyles.interestText,
                                            active && setupStyles.interestTextActive,
                                        ]}
                                    >
                                        {interest}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* CTA */}
                <Pressable
                    style={setupStyles.cta}
                    onPress={() =>
                        onConnect(selectedCamera, selectedMic, selectedInterests)
                    }
                >
                    <Text style={setupStyles.ctaText}>Find a match</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Connecting screen ───────────────────────────────────────────────────────

function ConnectingScreen({
    matchState,
    onCancel,
}: {
    matchState: "idle" | "waiting" | "matched";
    onCancel: () => void;
}) {
    const statusLabel =
        matchState === "matched"
            ? "Match found! Connecting…"
            : matchState === "waiting"
              ? "Looking for someone…"
              : "Connecting to matchmaking…";

    return (
        <SafeAreaView style={connectingStyles.root}>
            <View style={connectingStyles.card}>
                <PulsingDots />
                <Text style={connectingStyles.label}>{statusLabel}</Text>
                {matchState === "waiting" && (
                    <Text style={connectingStyles.hint}>
                        This usually takes a few seconds
                    </Text>
                )}
            </View>
            <Pressable style={connectingStyles.cancelBtn} onPress={onCancel}>
                <Text style={connectingStyles.cancelText}>Cancel</Text>
            </Pressable>
        </SafeAreaView>
    );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function VideoCall() {
    const ICEBREAKERS = [
        "What's the weirdest thing you've ever eaten?",
        "If you could live in any movie universe, which would you pick?",
        "What's a skill you're secretly proud of?",
        "What's the most spontaneous thing you've ever done?",
        "If you had to eat one meal forever, what would it be?",
        "What's your most controversial food opinion?",
        "Would you rather explore space or the deep ocean?",
        "What's the best trip you've ever been on?",
        "What did you want to be as a kid?",
        "What's your go-to karaoke song?",
        "What's a hobby you've always wanted to try?",
        "What's the last thing that made you laugh out loud?",
    ];
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
    const [localUrl, setLocalUrl] = useState<string | null>(null);
    const [remoteUrl, setRemoteUrl] = useState<string | null>(null);
    const roomIdRef = useRef<string | null>(null);

    const [isMuted, setIsMuted] = useState(false);
    //const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

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
    const videoProducerRef = useRef<any>(null);
    const localPreviewPos = useRef({ x: 0, y: 0 });
    const localPreviewAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
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

    // Track whether user has intentionally started connecting
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
            try {
                const res = await fetch(url, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    ...options,
                    ...(options?.headers
                        ? {
                              headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                  ...options.headers,
                              },
                          }
                        : {}),
                });
                const text = await res.text();
                if (!res.ok) throw new Error(`${res.status} ${text}`);
                return text ? JSON.parse(text) : {};
            } catch (error) {
                throw error;
            }
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

            setTimeout(() => {
                consumeExistingProducers().catch(console.error);
            }, 2000);

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

    const stopCall = useCallback(async () => {
        localStreamRef.current?.getTracks()?.forEach((t: any) => t.stop());
        localStreamRef.current = null;
        startingRef.current = false;
        connectingIntentRef.current = false;
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

        // Disconnect and clear matchmaking socket so a fresh one is created next time
        matchmakingSocketRef.current?.disconnect();
        matchmakingSocketRef.current = null;

        setScreen("setup");
    }, [api]);

    // Called when user taps "Find a match"
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
        Animated.timing(controlsOpacity, {
            toValue,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
        }).start(() => {
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

            // Replace track for remote peer
            if (videoProducerRef.current) {
                await videoProducerRef.current.replaceTrack({ track: newVideoTrack });
            }

            // Update local stream ref with new stream entirely
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
        if (icebreakerTimeoutRef.current) {
            clearTimeout(icebreakerTimeoutRef.current);
        }

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

        icebreakerTimeoutRef.current = setTimeout(() => {
            setIcebreakerLoading(false);
        }, 1500);
    }

    // Activate matchmaking once socket is ready (only when connecting screen is shown)
    useEffect(() => {
        if (!matchmakingReady) return;
        if (!connectingIntentRef.current) return;
        activateMatchmaking().catch(console.error);
    }, [matchmakingReady, activateMatchmaking]);

    // Start call once we have a room
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

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopTracksRef.current();
            matchmakingSocketRef.current?.disconnect();
            socketRef.current?.disconnect();
            sendTransportRef.current?.close();
            recvTransportRef.current?.close();
            const consumers = consumersRef.current;
            const consumed = consumedProducerIdsRef.current;
            const consuming = consumingProducerIdsRef.current;
            consumers.forEach((c) => {
                try {
                    c.close();
                } catch {}
            });
            consumers.clear();
            consumed.clear();
            consuming.clear();
        };
    }, []);

    // ── Screens ────────────────────────────────────────────────────────────

    if (screen === "setup") {
        return <SetupScreen onConnect={handleStartConnecting} />;
    }

    if (screen === "connecting") {
        return <ConnectingScreen matchState={matchState} onCancel={stopCall} />;
    }

    // ── Call screen (unchanged) ────────────────────────────────────────────

    return (
        <View style={styles.container}>
            <Pressable style={styles.videoLayer} onPress={toggleControls}>
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

                <Animated.View
                    style={{ opacity: controlsOpacity, ...StyleSheet.absoluteFillObject }}
                    pointerEvents={controlsVisible ? "box-none" : "none"}
                >
                    {localUrl && (
                        <Animated.View
                            style={[
                                styles.localPreviewWrapper,
                                { transform: localPreviewAnim.getTranslateTransform() },
                            ]}
                            {...panResponder.panHandlers}
                        >
                            <RTCView
                                streamURL={localUrl}
                                style={styles.localPreview}
                                objectFit="cover"
                                mirror={facingMode === "user"}
                            />
                        </Animated.View>
                    )}
                    {icebreakerVisible && (
                        <Animated.View
                            style={[
                                styles.icebreakerBubble,
                                { opacity: icebreakerOpacity },
                            ]}
                        >
                            {icebreakerLoading ? (
                                <View style={styles.icebreakerSkeleton} />
                            ) : (
                                <Text style={styles.icebreakerText}>
                                    {ICEBREAKERS[icebreakerIndex]}
                                </Text>
                            )}
                        </Animated.View>
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
                                onPress={flipCamera}
                                icon={
                                    <Ionicons
                                        name="camera-reverse-outline"
                                        size={22}
                                        color="#111"
                                    />
                                }
                            />
                            <ControlButton
                                onPress={handleLike}
                                variant="success"
                                icon={
                                    <Ionicons
                                        name="heart-outline"
                                        size={22}
                                        color="#fff"
                                    />
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
                </Animated.View>
            </Pressable>
        </View>
    );
}

// ─── ControlButton ───────────────────────────────────────────────────────────

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
// ─── Connecting styles ───────────────────────────────────────────────────────

const connectingStyles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#0b0b0b",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
    },
    card: {
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
    },
    label: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        letterSpacing: -0.2,
    },
    hint: {
        color: "#555",
        fontSize: 14,
        textAlign: "center",
        marginTop: -8,
    },
    cancelBtn: {
        position: "absolute",
        bottom: 48,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#2a2a2a",
    },
    cancelText: {
        color: "#666",
        fontSize: 15,
        fontWeight: "500",
    },
});

// ─── Loader styles ────────────────────────────────────────────────────────────

const loaderStyles = StyleSheet.create({
    dotsRow: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#fff",
    },
});

// ─── Call screen styles (unchanged) ──────────────────────────────────────────

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
    icebreakerBubble: {
        position: "absolute",
        left: 14,
        bottom: 110,
        maxWidth: 200,
        backgroundColor: "rgba(255,255,255,0.93)",
        borderRadius: 14,
        paddingHorizontal: 13,
        paddingVertical: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 6,
        elevation: 4,
    },
    icebreakerSkeleton: {
        width: 160,
        height: 36,
        borderRadius: 6,
        backgroundColor: "#ddd",
    },
    icebreakerText: {
        color: "#111",
        fontSize: 13,
        fontWeight: "500",
        lineHeight: 18,
    },
});
