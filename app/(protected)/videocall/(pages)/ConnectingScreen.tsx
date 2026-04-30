import { useNavigation } from "expo-router";
import { createT } from "@/i18n";
import { useTheme } from "@/lib/theme/context";
import { Theme } from "@/lib/theme/theme";
import { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Animated, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const t = createT("videocall.connecting");

function PulsingDots() {
    const { theme } = useTheme();
    const dot0 = useRef(new Animated.Value(0)).current;
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dots = [dot0, dot1, dot2];

    const s = makeStyle(theme);

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
        <View style={s.dotsRow}>
            {dots.map((dot, i) => (
                <Animated.View
                    key={i}
                    style={[
                        s.dot,
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

interface Props {
    matchState: "idle" | "waiting" | "matched";
    onCancel: () => void;
}

export function ConnectingScreen({ matchState, onCancel }: Props) {
    const { theme } = useTheme();
    const statusLabel =
        matchState === "matched"
            ? t("matchFound")
            : matchState === "waiting"
              ? t("looking")
              : t("connecting");

    const s = makeStyle(theme);

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

    return (
        <SafeAreaView style={s.root}>
            <View style={s.card}>
                <PulsingDots />
                <Text style={s.label}>{statusLabel}</Text>
                {matchState === "waiting" && <Text style={s.hint}>{t("hint")}</Text>}
            </View>
            <Pressable style={s.cancelBtn} onPress={onCancel}>
                <Text style={s.cancelText}>{t("cancel")}</Text>
            </Pressable>
        </SafeAreaView>
    );
}

const makeStyle = (theme: Theme) =>
    StyleSheet.create({
        root: {
            flex: 1,
            backgroundColor: theme.background,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 32,
        },
        card: { alignItems: "center", justifyContent: "center", gap: 20 },
        label: {
            color: theme.text,
            fontSize: 18,
            fontWeight: "600",
            textAlign: "center",
            letterSpacing: -0.2,
        },
        hint: { color: "#555", fontSize: 14, textAlign: "center", marginTop: -8 },
        cancelBtn: {
            position: "absolute",
            bottom: 48,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#2a2a2a",
        },
        cancelText: { color: "#666", fontSize: 15, fontWeight: "500" },
        dotsRow: {
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
            justifyContent: "center",
        },
        dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.base },
    });
