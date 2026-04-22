import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import Svg, { Path } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme/context";

const RETRY_INTERVAL = 20;
const CRACK_LENGTH = 50;

// viewBox "0 0 64 60" — symmetric heart, bottom point (32,57), top-center dip (32,14)
// Left bump peak (19,4), right bump peak (45,4), left/right extremes x=3/x=61
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
        function run() {
            pulse.setValue(1);
            splitLeft.setValue(0);
            splitRight.setValue(0);
            splitY.setValue(0);
            rotateLeft.setValue(0);
            rotateRight.setValue(0);
            crackDash.setValue(CRACK_LENGTH);
            crackOpacity.setValue(0);

            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 310);
            setTimeout(
                () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
                1120,
            );

            Animated.sequence([
                // Two heartbeats
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
                // Crack draws itself on
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
                // Break apart — halves fly open + crack fades
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
                // Hold broken
                Animated.delay(1400),
                // Reassemble
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
            ]).start(() => run());
        }

        run();
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

export default function OutageScreen() {
    const { theme } = useTheme();
    const [countdown, setCountdown] = useState(RETRY_INTERVAL);

    useEffect(() => {
        setCountdown(RETRY_INTERVAL);
        const interval = setInterval(() => {
            setCountdown((prev) => (prev <= 1 ? RETRY_INTERVAL : prev - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const s = styles(theme);

    return (
        <View style={s.container}>
            <BrokenHeart color={theme.primary} />
            <Text style={s.title}>We{"'"}re experiencing issues</Text>
            <Text style={s.body}>
                Our team is on it and working as fast as possible to get everything back
                up. We apologize for the inconvenience.
            </Text>
            <View style={s.retryBox}>
                <Text style={s.retryLabel}>Retrying in</Text>
                <Text style={s.retryCount}>{countdown}s</Text>
            </View>
        </View>
    );
}

const styles = (theme: any) =>
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
        retryBox: {
            marginTop: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: theme.card,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 12,
        },
        retryLabel: {
            fontSize: 14,
            color: theme.grayscale,
        },
        retryCount: {
            fontSize: 18,
            fontWeight: "700",
            color: theme.primary,
        },
    });
