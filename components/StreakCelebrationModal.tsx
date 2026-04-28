import { useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated,
    StatusBar,
} from "react-native";
import Svg, { Circle, Defs, Filter, FeGaussianBlur, FeComposite } from "react-native-svg";
import { Flame } from "lucide-react-native";
import { useTheme } from "@/lib/theme/context";

const { width: W, height: H } = Dimensions.get("window");

const PARTICLE_COUNT = 24;
const COLORS = [
    "#EC136A",
    "#FF6B9D",
    "#FFD700",
    "#FF8C00",
    "#A855F7",
    "#3B82F6",
    "#10B981",
    "#F472B6",
];

function Particle({ delay, color }: { delay: number; color: string }) {
    const x = useRef(new Animated.Value(0)).current;
    const y = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0)).current;
    const rotate = useRef(new Animated.Value(0)).current;

    const startX = (Math.random() - 0.5) * W * 1.4;
    const endY = H * 0.5 + Math.random() * H * 0.4;
    const endRotate = (Math.random() - 0.5) * 720;

    useEffect(() => {
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 80,
                    useNativeDriver: true,
                }),
                Animated.spring(scale, {
                    toValue: 1,
                    friction: 4,
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(y, {
                    toValue: endY,
                    duration: 1400 + Math.random() * 600,
                    useNativeDriver: true,
                }),
                Animated.timing(x, {
                    toValue: startX + (Math.random() - 0.5) * 100,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(rotate, {
                    toValue: endRotate,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.sequence([
                    Animated.delay(900),
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ]),
            ]),
        ]).start();
    }, []);

    const size = 7 + Math.random() * 9;
    const isRect = Math.random() > 0.5;
    const spin = rotate.interpolate({
        inputRange: [-720, 720],
        outputRange: ["-720deg", "720deg"],
    });

    return (
        <Animated.View
            style={{
                position: "absolute",
                top: H * 0.35,
                left: W / 2,
                width: size,
                height: isRect ? size * 0.45 : size,
                borderRadius: isRect ? 2 : size / 2,
                backgroundColor: color,
                opacity,
                transform: [
                    { translateX: x },
                    { translateY: y },
                    { scale },
                    { rotate: spin },
                ],
            }}
        />
    );
}

type Props = {
    streak: number;
    onDismiss: () => void;
};

export default function StreakCelebrationScreen({ streak, onDismiss }: Props) {
    const { theme } = useTheme();

    const bgOpacity = useRef(new Animated.Value(0)).current;
    const flameScale = useRef(new Animated.Value(0)).current;
    const flamePulse = useRef(new Animated.Value(1)).current;
    const glowScale = useRef(new Animated.Value(0.5)).current;
    const glowOpacity = useRef(new Animated.Value(0)).current;
    const numberScale = useRef(new Animated.Value(0)).current;
    const numberOpacity = useRef(new Animated.Value(0)).current;
    const textTranslate = useRef(new Animated.Value(30)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const buttonTranslate = useRef(new Animated.Value(50)).current;
    const buttonOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(bgOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.parallel([
                Animated.spring(flameScale, {
                    toValue: 1,
                    friction: 3,
                    tension: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(glowOpacity, {
                    toValue: 0.6,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.spring(glowScale, {
                    toValue: 1,
                    friction: 4,
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.spring(numberScale, {
                    toValue: 1,
                    friction: 4,
                    tension: 90,
                    useNativeDriver: true,
                }),
                Animated.timing(numberOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(textOpacity, {
                    toValue: 1,
                    duration: 350,
                    useNativeDriver: true,
                }),
                Animated.timing(textTranslate, {
                    toValue: 0,
                    duration: 350,
                    useNativeDriver: true,
                }),
                Animated.timing(buttonOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(buttonTranslate, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(flamePulse, {
                        toValue: 1.1,
                        duration: 700,
                        useNativeDriver: true,
                    }),
                    Animated.timing(flamePulse, {
                        toValue: 0.94,
                        duration: 700,
                        useNativeDriver: true,
                    }),
                ]),
            ).start();
        });
    }, []);

    const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        delay: i * 40 + Math.random() * 200,
        color: COLORS[i % COLORS.length],
    }));

    const message =
        streak >= 30
            ? "Legendary!"
            : streak >= 14
              ? "Unstoppable!"
              : streak >= 7
                ? "One week strong!"
                : streak >= 3
                  ? "Keep it going!"
                  : "Great start!";

    const sub =
        streak >= 7
            ? "You're building something real. See you tomorrow."
            : "Come back tomorrow to keep your streak alive.";

    return (
        <Animated.View
            style={[s.root, { backgroundColor: theme.rootBg, opacity: bgOpacity }]}
        >
            <StatusBar barStyle="light-content" />

            {particles.map((p) => (
                <Particle key={p.id} delay={p.delay} color={p.color} />
            ))}

            {/* true SVG blur glow */}
            <Animated.View
                style={[
                    s.glowBase,
                    { opacity: glowOpacity, transform: [{ scale: glowScale }] },
                ]}
                pointerEvents="none"
            >
                <Svg width={500} height={500} viewBox="0 0 500 500">
                    <Defs>
                        <Filter id="glow1" x="-80%" y="-80%" width="260%" height="260%">
                            <FeGaussianBlur stdDeviation="40" result="blur" />
                        </Filter>
                        <Filter id="glow2" x="-60%" y="-60%" width="220%" height="220%">
                            <FeGaussianBlur stdDeviation="22" result="blur" />
                        </Filter>
                        <Filter id="glow3" x="-40%" y="-40%" width="180%" height="180%">
                            <FeGaussianBlur stdDeviation="10" result="blur" />
                        </Filter>
                    </Defs>
                    {/* outer soft halo */}
                    <Circle
                        cx="250"
                        cy="250"
                        r="130"
                        fill={theme.primary}
                        fillOpacity={0.35}
                        filter="url(#glow1)"
                    />
                    {/* mid glow */}
                    <Circle
                        cx="250"
                        cy="250"
                        r="90"
                        fill={theme.primary}
                        fillOpacity={0.45}
                        filter="url(#glow2)"
                    />
                    {/* inner bright core */}
                    <Circle
                        cx="250"
                        cy="250"
                        r="55"
                        fill={theme.primary}
                        fillOpacity={0.55}
                        filter="url(#glow3)"
                    />
                </Svg>
            </Animated.View>

            {/* flame */}
            <Animated.View
                style={[
                    s.flameWrap,
                    { transform: [{ scale: Animated.multiply(flameScale, flamePulse) }] },
                ]}
            >
                <View style={[s.flameCircle, { backgroundColor: theme.primary }]}>
                    <Flame color="#fff" size={64} strokeWidth={1.5} />
                </View>
            </Animated.View>

            {/* number */}
            <Animated.View
                style={[
                    s.numberWrap,
                    { opacity: numberOpacity, transform: [{ scale: numberScale }] },
                ]}
            >
                <Text style={[s.number, { color: theme.text }]}>{streak}</Text>
                <Text style={[s.dayLabel, { color: theme.text + "55" }]}>day streak</Text>
            </Animated.View>

            {/* text */}
            <Animated.View
                style={[
                    s.textBlock,
                    { opacity: textOpacity, transform: [{ translateY: textTranslate }] },
                ]}
            >
                <Text style={[s.message, { color: theme.text }]}>{message}</Text>
                <Text style={[s.sub, { color: theme.text + "66" }]}>{sub}</Text>
            </Animated.View>

            {/* button */}
            <Animated.View
                style={[
                    s.buttonWrap,
                    {
                        opacity: buttonOpacity,
                        transform: [{ translateY: buttonTranslate }],
                    },
                ]}
            >
                <TouchableOpacity
                    style={[s.button, { backgroundColor: theme.primary }]}
                    onPress={onDismiss}
                    activeOpacity={0.85}
                >
                    <Text style={s.buttonText}>Continue</Text>
                </TouchableOpacity>
            </Animated.View>
        </Animated.View>
    );
}

const s = StyleSheet.create({
    root: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
    },
    glowBase: {
        position: "absolute",
        top: H * 0.1,
        alignSelf: "center",
    },
    flameWrap: {
        marginBottom: 8,
    },
    flameCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#EC136A",
        shadowOpacity: 0.7,
        shadowRadius: 30,
        elevation: 16,
    },
    numberWrap: {
        alignItems: "center",
        marginTop: 16,
    },
    number: {
        fontSize: 96,
        fontWeight: "900",
        letterSpacing: -4,
        lineHeight: 100,
        textAlign: "center",
    },
    dayLabel: {
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        marginTop: 4,
        letterSpacing: 0.3,
    },
    textBlock: {
        alignItems: "center",
        marginTop: 20,
        gap: 8,
    },
    message: {
        fontSize: 28,
        fontWeight: "900",
        textAlign: "center",
        letterSpacing: -0.5,
    },
    sub: {
        fontSize: 15,
        textAlign: "center",
        lineHeight: 22,
        maxWidth: 280,
    },
    buttonWrap: {
        position: "absolute",
        bottom: 52,
        left: 32,
        right: 32,
    },
    button: {
        borderRadius: 18,
        paddingVertical: 18,
        alignItems: "center",
        shadowColor: "#EC136A",
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "800",
        fontSize: 18,
        letterSpacing: 0.3,
    },
});
