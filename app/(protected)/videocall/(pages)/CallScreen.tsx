import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,
    PanResponder,
    useWindowDimensions,
} from "react-native";
import i18n, { createT } from "@/i18n";
import { RTCView } from "react-native-webrtc";
import {
    Ionicons,
    MaterialCommunityIcons,
    Feather,
    FontAwesome6,
} from "@expo/vector-icons";
import { useSafeAreaControl } from "@/components/SafeArea";
import { useEffect, useRef, useState } from "react";
import { useNavigation } from "expo-router";

const tCall = createT("videocall.call");

export const ICEBREAKERS = Array.from({ length: 12 }, (_, i) =>
    i18n.t(`videocall.icebreakers.${i}`),
);

const PREVIEW_W = 94;
const PREVIEW_H = 154;
const MARGIN = 16;
const TOP_INSET = 80;
const BOTTOM_INSET = 120;

interface Props {
    remoteUrl: string | null;
    localUrl: string | null;
    isMuted: boolean;
    facingMode: "user" | "environment";
    controlsVisible: boolean;
    controlsOpacity: Animated.Value;
    icebreakerVisible: boolean;
    icebreakerLoading: boolean;
    icebreakerIndex: number;
    icebreakerOpacity: Animated.Value;
    isLiked: boolean;
    receivedLike: boolean;
    mutualLike: boolean;
    onToggleControls: () => void;
    onToggleMute: () => void;
    onFlipCamera: () => void;
    onStop: () => void;
    onLike: () => void;
    onLikeBack: () => void;
    onNextUser: () => void;
    onReaction: () => void;
    onIcebreaker: () => void;
}

export function CallScreen({
    remoteUrl,
    localUrl,
    isMuted,
    facingMode,
    controlsVisible,
    controlsOpacity,
    icebreakerVisible,
    icebreakerLoading,
    icebreakerIndex,
    icebreakerOpacity,
    isLiked,
    receivedLike,
    mutualLike,
    onToggleControls,
    onToggleMute,
    onFlipCamera,
    onStop,
    onLike,
    onLikeBack,
    onNextUser,
    onReaction,
    onIcebreaker,
}: Props) {
    const likeNotifOpacity = useRef(new Animated.Value(0)).current;
    const showBanner = receivedLike || mutualLike;

    useEffect(() => {
        Animated.timing(likeNotifOpacity, {
            toValue: showBanner ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [showBanner, likeNotifOpacity]);

    const { setDisableSafeArea } = useSafeAreaControl();
    const { width: W, height: H } = useWindowDimensions();

    useEffect(() => {
        setDisableSafeArea(true);
        return () => setDisableSafeArea(false);
    });

    const parentNavigation = useNavigation("/(protected)");
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({ gestureEnabled: false });
        parentNavigation.setOptions({ gestureEnabled: false });
        return () => {
            navigation.setOptions({ gestureEnabled: true });
            parentNavigation.setOptions({ gestureEnabled: true });
        };
    }, [navigation, parentNavigation]);

    // Corner positions
    const corners = {
        topLeft: { x: MARGIN, y: TOP_INSET },
        topRight: { x: W - PREVIEW_W - MARGIN, y: TOP_INSET },
        bottomLeft: { x: MARGIN, y: H - PREVIEW_H - BOTTOM_INSET },
        bottomRight: { x: W - PREVIEW_W - MARGIN, y: H - PREVIEW_H - BOTTOM_INSET },
    };

    const [swapped, setSwapped] = useState(false);
    const swapScale = useRef(new Animated.Value(1)).current;

    function handleSwap() {
        Animated.sequence([
            Animated.spring(swapScale, {
                toValue: 0.88,
                useNativeDriver: true,
                speed: 40,
                bounciness: 0,
            }),
            Animated.spring(swapScale, {
                toValue: 1,
                useNativeDriver: true,
                speed: 14,
                bounciness: 8,
            }),
        ]).start();
        setSwapped((v) => !v);
    }

    const bgUrl = swapped ? localUrl : remoteUrl;
    const previewUrl = swapped ? remoteUrl : localUrl;
    const previewMirror = swapped ? false : facingMode === "user";

    const pos = useRef(new Animated.ValueXY(corners.topRight)).current;
    const currentPos = useRef(corners.topRight);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                pos.setOffset(currentPos.current);
                pos.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event([null, { dx: pos.x, dy: pos.y }], {
                useNativeDriver: false,
            }),
            onPanResponderRelease: () => {
                pos.flattenOffset();
                const cx = (pos.x as any)._value + PREVIEW_W / 2;
                const cy = (pos.y as any)._value + PREVIEW_H / 2;

                // Pick nearest corner
                const nearest = Object.values({
                    topLeft: corners.topLeft,
                    topRight: corners.topRight,
                    bottomLeft: corners.bottomLeft,
                    bottomRight: corners.bottomRight,
                }).reduce((best, c) =>
                    Math.hypot(cx - (c.x + PREVIEW_W / 2), cy - (c.y + PREVIEW_H / 2)) <
                    Math.hypot(
                        cx - (best.x + PREVIEW_W / 2),
                        cy - (best.y + PREVIEW_H / 2),
                    )
                        ? c
                        : best,
                );

                currentPos.current = nearest;
                Animated.spring(pos, {
                    toValue: nearest,
                    useNativeDriver: false,
                    bounciness: 6,
                }).start();
            },
        }),
    ).current;

    const likeButtonVariant = mutualLike || receivedLike ? "liked" : "success";
    const likeButtonIcon = isLiked || mutualLike ? "heart" : "heart-outline";
    const likeButtonPress = mutualLike ? undefined : receivedLike ? onLikeBack : onLike;

    return (
        <View style={s.container}>
            <Pressable style={s.videoLayer} onPress={onToggleControls}>
                {bgUrl ? (
                    <RTCView
                        key={bgUrl}
                        streamURL={bgUrl}
                        style={s.remoteVideo}
                        objectFit="cover"
                        mirror={swapped && facingMode === "user"}
                    />
                ) : (
                    <View style={[s.remoteVideo, s.waitingContainer]}>
                        <Text style={s.waitingText}>{tCall("waitingForPartner")}</Text>
                    </View>
                )}

                <View style={s.topBar} pointerEvents="box-none">
                    <Pressable style={s.topButton} onPress={onStop}>
                        <Ionicons name="chevron-back" size={22} color="#fff" />
                    </Pressable>
                </View>

                <Animated.View
                    style={{ opacity: controlsOpacity, ...StyleSheet.absoluteFill }}
                    pointerEvents={controlsVisible ? "box-none" : "none"}
                >
                    {icebreakerVisible && (
                        <Animated.View
                            style={[s.icebreakerBubble, { opacity: icebreakerOpacity }]}
                        >
                            {icebreakerLoading ? (
                                <View style={s.icebreakerSkeleton} />
                            ) : (
                                <Text style={s.icebreakerText}>
                                    {ICEBREAKERS[icebreakerIndex]}
                                </Text>
                            )}
                        </Animated.View>
                    )}
                    <View style={s.bottomControlsWrapper}>
                        <View style={s.bottomControls}>
                            <ControlButton
                                onPress={onToggleMute}
                                icon={
                                    <Feather
                                        name={isMuted ? "mic-off" : "mic"}
                                        size={22}
                                        color="#111"
                                    />
                                }
                            />
                            <ControlButton
                                onPress={onFlipCamera}
                                icon={
                                    <Ionicons
                                        name="camera-reverse-outline"
                                        size={22}
                                        color="#111"
                                    />
                                }
                            />
                            <ControlButton
                                onPress={likeButtonPress ?? (() => {})}
                                variant={likeButtonVariant}
                                icon={
                                    <Ionicons
                                        name={likeButtonIcon}
                                        size={22}
                                        color="#fff"
                                    />
                                }
                            />
                            <ControlButton
                                onPress={onNextUser}
                                variant="danger"
                                icon={<Ionicons name="close" size={24} color="#fff" />}
                            />
                            <ControlButton
                                onPress={onReaction}
                                icon={
                                    <FontAwesome6
                                        name="face-smile-beam"
                                        size={20}
                                        color="#111"
                                    />
                                }
                            />
                            <ControlButton
                                onPress={onIcebreaker}
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

                {previewUrl && (
                    <Animated.View
                        style={[
                            s.localPreviewWrapper,
                            pos.getLayout(),
                            { transform: [{ scale: swapScale }] },
                        ]}
                        {...panResponder.panHandlers}
                    >
                        <RTCView
                            streamURL={previewUrl}
                            style={StyleSheet.absoluteFill}
                            objectFit="cover"
                            mirror={previewMirror}
                        />
                        <Pressable style={StyleSheet.absoluteFill} onPress={handleSwap} />
                    </Animated.View>
                )}
            </Pressable>
        </View>
    );
}

function ControlButton({
    onPress,
    icon,
    variant = "default",
}: {
    onPress: () => void;
    icon: React.ReactNode;
    variant?: "default" | "success" | "danger" | "liked";
}) {
    return (
        <Pressable
            onPress={onPress}
            style={[
                s.controlButton,
                variant === "success" && s.controlButtonSuccess,
                variant === "danger" && s.controlButtonDanger,
                variant === "liked" && s.controlButtonLiked,
            ]}
        >
            {icon}
        </Pressable>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    videoLayer: { flex: 1, position: "relative", backgroundColor: "#000" },
    remoteVideo: { ...StyleSheet.absoluteFillObject, backgroundColor: "#111" },
    waitingContainer: { alignItems: "center", justifyContent: "center" },
    waitingText: { color: "#fff", fontSize: 18, fontWeight: "600" },
    localPreviewWrapper: {
        position: "absolute",
        width: PREVIEW_W,
        height: PREVIEW_H,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#222",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    topBar: {
        position: "absolute",
        zIndex: 10,
        top: 60,
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
    bottomControlsWrapper: { position: "absolute", left: 10, right: 10, bottom: 16 },
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
    controlButtonSuccess: { backgroundColor: "#45c466", borderColor: "#45c466" },
    controlButtonDanger: { backgroundColor: "#df1d1d", borderColor: "#df1d1d" },
    controlButtonLiked: { backgroundColor: "#e91e8c", borderColor: "#e91e8c" },
    likeNotification: {
        position: "absolute",
        top: 120,
        alignSelf: "center",
        backgroundColor: "#e91e8c",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    likeNotificationText: { color: "#fff", fontSize: 14, fontWeight: "600" as const },
    likeBackButton: {
        backgroundColor: "rgba(255,255,255,0.25)",
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    likeBackText: { color: "#fff", fontSize: 13, fontWeight: "700" as const },
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
    icebreakerText: { color: "#111", fontSize: 13, fontWeight: "500", lineHeight: 18 },
});
