import i18n, { createT } from "@/i18n";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { RTCView } from "react-native-webrtc";
import {
    Ionicons,
    MaterialCommunityIcons,
    Feather,
    FontAwesome6,
} from "@expo/vector-icons";
import { useSafeAreaControl } from "@/components/SafeArea";
import { useEffect, useRef, useMemo } from "react";
import { useTheme } from "@/lib/theme/context";
import { Theme } from "@/lib/theme/theme";

const tCall = createT("videocall.call");

export const ICEBREAKERS = Array.from({ length: 12 }, (_, i) =>
    i18n.t(`videocall.icebreakers.${i}`),
);

export const REACTION_EMOJIS = ["😂", "❤️", "🔥", "😮", "👋", "👏", "🎉", "😍"];

function FloatingReaction({ emoji, startX }: { emoji: string; startX: number }) {
    const translateY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const scale = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -280,
                duration: 2200,
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 1,
                friction: 4,
                tension: 80,
                useNativeDriver: true,
            }),
            Animated.sequence([
                Animated.delay(1400),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    return (
        <Animated.Text
            style={[
                styles.floatingReaction,
                { left: startX, transform: [{ translateY }, { scale }], opacity },
            ]}
        >
            {emoji}
        </Animated.Text>
    );
}

interface Props {
    remoteUrl: string | null;
    localUrl: string | null;
    isMuted: boolean;
    facingMode: "user" | "environment";
    controlsVisible: boolean;
    controlsOpacity: Animated.Value;
    previewBottomAnim: Animated.Value;
    localPreviewAnim: Animated.ValueXY;
    panHandlers: object;
    icebreakerVisible: boolean;
    icebreakerLoading: boolean;
    icebreakerIndex: number;
    icebreakerOpacity: Animated.Value;
    isLiked: boolean;
    receivedLike: boolean;
    mutualLike: boolean;
    reactionPickerVisible: boolean;
    floatingReactions: { id: string; emoji: string; startX: number }[];
    onSelectReaction: (emoji: string) => void;
    onCloseReactionPicker: () => void;
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
    previewBottomAnim,
    localPreviewAnim,
    panHandlers,
    icebreakerVisible,
    icebreakerLoading,
    icebreakerIndex,
    icebreakerOpacity,
    isLiked,
    receivedLike,
    mutualLike,
    reactionPickerVisible,
    floatingReactions,
    onSelectReaction,
    onCloseReactionPicker,
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
    const { theme } = useTheme();
    const s = useMemo(() => makeStyles(theme), [theme]);

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

    useEffect(() => {
        setDisableSafeArea(true);
        return () => {
            setDisableSafeArea(false);
        };
    });

    const likeButtonVariant = mutualLike || receivedLike ? "liked" : "success";
    const likeButtonIcon = isLiked || mutualLike ? "heart" : "heart-outline";
    const likeButtonPress = mutualLike ? undefined : receivedLike ? onLikeBack : onLike;

    return (
        <View style={s.container}>
            <Pressable style={s.videoLayer} onPress={onToggleControls}>
                {remoteUrl ? (
                    <RTCView
                        key={remoteUrl}
                        streamURL={remoteUrl}
                        style={s.remoteVideo}
                        objectFit="cover"
                        mirror={false}
                    />
                ) : (
                    <View style={[s.remoteVideo, s.waitingContainer]}>
                        <Text style={s.waitingText}>{tCall("waitingForPartner")}</Text>
                    </View>
                )}

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
                    <View style={s.topBar}>
                        <Pressable style={s.topButton} onPress={onStop}>
                            <Ionicons name="chevron-back" size={22} color="#fff" />
                        </Pressable>
                    </View>
                    <View style={s.bottomControlsWrapper}>
                        <View style={s.bottomControls}>
                            <ControlButton
                                onPress={onToggleMute}
                                backgroundColor={theme.cardBg}
                                borderColor={theme.cardAccent}
                                icon={
                                    <Feather
                                        name={isMuted ? "mic-off" : "mic"}
                                        size={22}
                                        color={theme.text}
                                    />
                                }
                            />
                            <ControlButton
                                onPress={onFlipCamera}
                                backgroundColor={theme.cardBg}
                                borderColor={theme.cardAccent}
                                icon={
                                    <Ionicons
                                        name="camera-reverse-outline"
                                        size={22}
                                        color={theme.text}
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
                                backgroundColor={theme.cardBg}
                                borderColor={theme.cardAccent}
                                icon={
                                    <FontAwesome6
                                        name="face-smile-beam"
                                        size={20}
                                        color={theme.text}
                                    />
                                }
                            />
                            <ControlButton
                                onPress={onIcebreaker}
                                backgroundColor={theme.cardBg}
                                borderColor={theme.cardAccent}
                                icon={
                                    <MaterialCommunityIcons
                                        name="magic-staff"
                                        size={22}
                                        color={theme.text}
                                    />
                                }
                            />
                        </View>
                    </View>
                </Animated.View>

                <Animated.View
                    style={[s.likeNotification, { opacity: likeNotifOpacity }]}
                    pointerEvents={showBanner && !mutualLike ? "box-none" : "none"}
                >
                    <Ionicons name="heart" size={16} color="#fff" />
                    {mutualLike ? (
                        <Text style={s.likeNotificationText}>{"It's a match! 💬"}</Text>
                    ) : (
                        <>
                            <Text style={s.likeNotificationText}>You got liked!</Text>
                            <Pressable style={s.likeBackButton} onPress={onLikeBack}>
                                <Text style={s.likeBackText}>Like back</Text>
                            </Pressable>
                        </>
                    )}
                </Animated.View>

                {localUrl && (
                    <Animated.View
                        style={[
                            s.localPreviewWrapper,
                            {
                                transform: localPreviewAnim.getTranslateTransform(),
                                bottom: previewBottomAnim,
                            },
                        ]}
                        {...panHandlers}
                        onStartShouldSetResponder={() => true}
                    >
                        <View pointerEvents="none" style={{ flex: 1 }}>
                            <RTCView
                                streamURL={localUrl}
                                style={s.localPreview}
                                objectFit="cover"
                                mirror={facingMode === "user"}
                            />
                        </View>
                    </Animated.View>
                )}
            </Pressable>

            {floatingReactions.map((r) => (
                <FloatingReaction key={r.id} emoji={r.emoji} startX={r.startX} />
            ))}

            {reactionPickerVisible && (
                <Pressable style={s.pickerBackdrop} onPress={onCloseReactionPicker}>
                    <View style={s.pickerSheet}>
                        <View style={s.pickerHandle} />
                        <Text style={s.pickerLabel}>React</Text>
                        <View style={s.pickerGrid}>
                            {REACTION_EMOJIS.map((emoji) => (
                                <Pressable
                                    key={emoji}
                                    style={s.emojiButton}
                                    onPress={() => onSelectReaction(emoji)}
                                >
                                    <Text style={s.emojiText}>{emoji}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </Pressable>
            )}
        </View>
    );
}

function ControlButton({
    onPress,
    icon,
    variant = "default",
    backgroundColor,
    borderColor,
}: {
    onPress: () => void;
    icon: React.ReactNode;
    variant?: "default" | "success" | "danger" | "liked";
    backgroundColor?: string;
    borderColor?: string;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.controlButton,
                {
                    backgroundColor: backgroundColor ?? "rgba(255,255,255,0.12)",
                    borderColor: borderColor ?? "rgba(255,255,255,0.18)",
                },
                variant === "success" && styles.controlButtonSuccess,
                variant === "danger" && styles.controlButtonDanger,
                variant === "liked" && styles.controlButtonLiked,
            ]}
        >
            {icon}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    floatingReaction: {
        position: "absolute",
        bottom: 130,
        fontSize: 38,
    },
    controlButton: {
        width: 54,
        height: 54,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },
    controlButtonSuccess: { backgroundColor: "#45c466", borderColor: "#45c466" },
    controlButtonDanger: { backgroundColor: "#df1d1d", borderColor: "#df1d1d" },
    controlButtonLiked: { backgroundColor: "#e91e8c", borderColor: "#e91e8c" },
});

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: "#000" },
        videoLayer: { flex: 1, position: "relative", backgroundColor: "#000" },
        remoteVideo: { ...StyleSheet.absoluteFillObject, backgroundColor: "#111" },
        waitingContainer: { alignItems: "center", justifyContent: "center" },
        waitingText: { color: "#fff", fontSize: 18, fontWeight: "600" },
        localPreviewWrapper: {
            position: "absolute",
            right: 16,
            width: 94,
            height: 154,
            borderRadius: 16,
            overflow: "hidden",
            backgroundColor: "#222",
            borderWidth: 1.5,
            borderColor: "rgba(255,255,255,0.18)",
        },
        localPreview: { width: "100%", height: "100%", backgroundColor: "#222" },
        topBar: {
            position: "absolute",
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
            backgroundColor: theme.background + "ee",
            borderRadius: 24,
            paddingHorizontal: 10,
            paddingVertical: 10,
        },
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
            backgroundColor: theme.background,
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
            backgroundColor: theme.cardBg,
        },
        icebreakerText: {
            color: theme.text,
            fontSize: 13,
            fontWeight: "500",
            lineHeight: 18,
        },
        pickerBackdrop: {
            ...StyleSheet.absoluteFillObject,
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: 110,
        },
        pickerSheet: {
            width: 220,
            backgroundColor: theme.background + "f5",
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingTop: 10,
            paddingBottom: 14,
            alignItems: "center",
        },
        pickerHandle: {
            width: 36,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.barInactive,
            marginBottom: 8,
        },
        pickerLabel: {
            color: theme.grayscale,
            fontSize: 11,
            fontWeight: "600",
            letterSpacing: 0.5,
            textTransform: "uppercase",
            marginBottom: 10,
        },
        pickerGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 6,
        },
        emojiButton: {
            width: 52,
            height: 52,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 14,
            backgroundColor: theme.cardBg,
        },
        emojiText: { fontSize: 26 },
    });
