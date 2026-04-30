import { createT } from "@/i18n";
import { useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Easing,
    Pressable,
    ScrollView,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme/context";
import { router } from "expo-router";

const t = createT("error");

const CRACK_LENGTH = 50;

const LEFT_PATH = "M 32 57 C 9 44 3 30 3 20 C 3 10 11 4 19 4 C 25 4 29 8 32 14";
const RIGHT_PATH = "M 32 14 C 35 8 39 4 45 4 C 53 4 61 10 61 20 C 61 30 55 44 32 57";
const CRACK_PATH = "M 32 15 L 29 26 L 35 31 L 28 43 L 33 49 L 32 57";

const AnimatedPath = Animated.createAnimatedComponent(Path);

function BrokenHeart({ color }: { color: string }) {
    const pulse = useRef(new Animated.Value(1)).current;
    const splitLeft = useRef(new Animated.Value(0)).current;
    const splitRight = useRef(new Animated.Value(0)).current;
    const splitY = useRef(new Animated.Value(0)).current;
    const rotateLeft = useRef(new Animated.Value(0)).current;
    const rotateRight = useRef(new Animated.Value(0)).current;
    const crackDash = useRef(new Animated.Value(CRACK_LENGTH)).current;
    const crackOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let mounted = true;
        const timeouts: ReturnType<typeof setTimeout>[] = [];

        function run() {
            if (!mounted) return;

            pulse.setValue(1);
            splitLeft.setValue(0);
            splitRight.setValue(0);
            splitY.setValue(0);
            rotateLeft.setValue(0);
            rotateRight.setValue(0);
            crackDash.setValue(CRACK_LENGTH);
            crackOpacity.setValue(0);

            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            timeouts.push(
                setTimeout(() => {
                    if (mounted) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }, 310),
            );
            timeouts.push(
                setTimeout(() => {
                    if (mounted) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                }, 1120),
            );

            Animated.sequence([
                Animated.sequence([
                    Animated.timing(pulse, {
                        toValue: 1.2,
                        duration: 180,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulse, {
                        toValue: 0.92,
                        duration: 130,
                        easing: Easing.in(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulse, {
                        toValue: 1.15,
                        duration: 160,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulse, {
                        toValue: 1,
                        duration: 180,
                        easing: Easing.in(Easing.quad),
                        useNativeDriver: true,
                    }),
                ]),
                Animated.delay(250),
                Animated.parallel([
                    Animated.timing(crackOpacity, {
                        toValue: 1,
                        duration: 120,
                        useNativeDriver: false,
                    }),
                    Animated.timing(crackDash, {
                        toValue: 0,
                        duration: 380,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: false,
                    }),
                ]),
                Animated.delay(120),
                Animated.parallel([
                    Animated.timing(splitLeft, {
                        toValue: -12,
                        duration: 520,
                        easing: Easing.out(Easing.back(1.2)),
                        useNativeDriver: true,
                    }),
                    Animated.timing(splitRight, {
                        toValue: 12,
                        duration: 520,
                        easing: Easing.out(Easing.back(1.2)),
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateLeft, {
                        toValue: -14,
                        duration: 520,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateRight, {
                        toValue: 14,
                        duration: 520,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(splitY, {
                        toValue: 6,
                        duration: 520,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(crackOpacity, {
                        toValue: 0,
                        duration: 300,
                        easing: Easing.in(Easing.quad),
                        useNativeDriver: false,
                    }),
                ]),
                Animated.delay(1400),
                Animated.parallel([
                    Animated.timing(splitLeft, {
                        toValue: 0,
                        duration: 420,
                        easing: Easing.inOut(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(splitRight, {
                        toValue: 0,
                        duration: 420,
                        easing: Easing.inOut(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateLeft, {
                        toValue: 0,
                        duration: 420,
                        easing: Easing.inOut(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateRight, {
                        toValue: 0,
                        duration: 420,
                        easing: Easing.inOut(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(splitY, {
                        toValue: 0,
                        duration: 420,
                        easing: Easing.inOut(Easing.quad),
                        useNativeDriver: true,
                    }),
                ]),
                Animated.delay(900),
            ]).start(({ finished }) => {
                if (finished && mounted) run();
            });
        }

        run();

        return () => {
            mounted = false;
            timeouts.forEach(clearTimeout);
            [
                pulse,
                splitLeft,
                splitRight,
                splitY,
                rotateLeft,
                rotateRight,
                crackDash,
                crackOpacity,
            ].forEach((v) => v.stopAnimation());
        };
    }, []);

    const leftTransform = [
        { translateX: splitLeft },
        { translateY: splitY },
        {
            rotate: rotateLeft.interpolate({
                inputRange: [-14, 0],
                outputRange: ["-14deg", "0deg"],
            }),
        },
    ];
    const rightTransform = [
        { translateX: splitRight },
        { translateY: splitY },
        {
            rotate: rotateRight.interpolate({
                inputRange: [0, 14],
                outputRange: ["0deg", "14deg"],
            }),
        },
    ];

    return (
        <Animated.View style={{ width: 64, height: 60, transform: [{ scale: pulse }] }}>
            <Animated.View
                style={[StyleSheet.absoluteFill, { transform: leftTransform }]}
            >
                <Svg width={64} height={60} viewBox="0 0 64 60">
                    <Path
                        d={LEFT_PATH}
                        stroke={color}
                        strokeWidth={3.5}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </Svg>
            </Animated.View>
            <Animated.View
                style={[StyleSheet.absoluteFill, { transform: rightTransform }]}
            >
                <Svg width={64} height={60} viewBox="0 0 64 60">
                    <Path
                        d={RIGHT_PATH}
                        stroke={color}
                        strokeWidth={3.5}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </Svg>
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: crackOpacity }]}>
                <Svg width={64} height={60} viewBox="0 0 64 60">
                    <AnimatedPath
                        d={CRACK_PATH}
                        stroke={color}
                        strokeWidth={2.5}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray={`${CRACK_LENGTH}`}
                        strokeDashoffset={crackDash}
                    />
                </Svg>
            </Animated.View>
        </Animated.View>
    );
}

type Props = {
    error: Error;
    retry?: () => void;
};

export function ErrorScreen({ error, retry }: Props) {
    const { theme } = useTheme();
    const s = makeStyles(theme);

    return (
        <View style={s.container}>
            <BrokenHeart color={theme.primary} />
            <Text style={s.title}>{t("title")}</Text>
            <Text style={s.body}>{t("body")}</Text>

            {__DEV__ && (
                <ScrollView style={s.devBox} contentContainerStyle={s.devContent}>
                    <Text style={s.devLabel}>DEV — error details</Text>
                    <Text style={s.devMessage}>{error.message}</Text>
                    {error.stack ? <Text style={s.devStack}>{error.stack}</Text> : null}
                </ScrollView>
            )}

            <View style={s.actions}>
                {retry && (
                    <Pressable
                        style={({ pressed }) => [
                            s.btn,
                            s.btnPrimary,
                            pressed && { opacity: 0.8 },
                        ]}
                        onPress={retry}
                    >
                        <Text style={s.btnPrimaryText}>{t("tryAgain")}</Text>
                    </Pressable>
                )}
                <Pressable
                    style={({ pressed }) => [
                        s.btn,
                        s.btnSecondary,
                        pressed && { opacity: 0.8 },
                    ]}
                    onPress={() =>
                        router.canGoBack() ? router.back() : router.replace("/")
                    }
                >
                    <Text style={s.btnSecondaryText}>{t("goBack")}</Text>
                </Pressable>
            </View>
        </View>
    );
}

const makeStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 32,
            gap: 20,
        },
        title: {
            fontSize: 22,
            fontWeight: "700",
            color: theme.text,
            textAlign: "center",
        },
        body: {
            fontSize: 15,
            color: theme.grayscale,
            textAlign: "center",
            lineHeight: 22,
        },
        devBox: {
            width: "100%",
            maxHeight: 200,
            backgroundColor: theme.card,
            borderRadius: 12,
        },
        devContent: { padding: 14, gap: 6 },
        devLabel: {
            color: theme.primary,
            fontSize: 10,
            fontWeight: "800",
            letterSpacing: 1,
            textTransform: "uppercase",
        },
        devMessage: { color: theme.text, fontSize: 13, fontWeight: "600" },
        devStack: { color: theme.grayscale, fontSize: 11, lineHeight: 16 },
        actions: { flexDirection: "row", gap: 10, marginTop: 4 },
        btn: {
            borderRadius: 22,
            paddingVertical: 12,
            paddingHorizontal: 22,
        },
        btnPrimary: { backgroundColor: theme.primary },
        btnPrimaryText: { color: theme.white ?? "#fff", fontWeight: "700", fontSize: 14 },
        btnSecondary: {
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.text + "18",
        },
        btnSecondaryText: { color: theme.text, fontWeight: "600", fontSize: 14 },
    });
