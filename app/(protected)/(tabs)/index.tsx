import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View, Text, Pressable } from "react-native";
import { useTheme } from "@/lib/theme/context";
import { Theme } from "@/lib/theme/theme";
import { router } from "expo-router";
import { CONSTANTS, PlanType } from "@/lib/constants";
import { Heart } from "lucide-react-native";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useActivePlan } from "@/hooks/useActivePlan";
import * as StoreReview from "expo-store-review";
import { PAD, GAP } from "@/components/videocall/homeConstants";
import { images } from "@/components/videocall/homeImages";
import { InfiniteColumn } from "@/components/videocall/InfiniteColumn";

const handleReview = async () => {
    if (await StoreReview.isAvailableAsync()) {
        await StoreReview.requestReview();
    }
};

function canCall(plan: PlanType, count: number | undefined) {
    return (
        CONSTANTS.PLANS[plan].maxCalls >
        (count !== undefined ? count : CONSTANTS.PLANS[plan].maxCalls)
    );
}

export default function Index() {
    const { theme, gs } = useTheme();
    const { plan } = useActivePlan();
    const [callsData, , , refetch] = useAuthFetch<{ callsToday: number }>(
        "/users/calls-left",
        undefined,
        { manual: true },
    );

    const hasFetched = useRef(false);

    useEffect(() => {
        if (!hasFetched.current) {
            hasFetched.current = true;
            refetch().catch(() => {});
        }
    }, [refetch]);

    const styles = makeStyles(theme);

    const leftBase = images.filter((i) => i.col === "left");
    const rightBase = images.filter((i) => i.col === "right");

    const LEFT_DURATION = 7000;
    const RIGHT_DURATION = 9000;

    const spin = useRef(new Animated.Value(0)).current;
    const spin2 = useRef(new Animated.Value(0)).current;
    const spin3 = useRef(new Animated.Value(0)).current;
    const zoom = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        let active = true;

        const runSpin = (val: Animated.Value, duration: number) => {
            val.setValue(0);
            Animated.timing(val, {
                toValue: 1,
                duration,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (finished && active)
                    requestAnimationFrame(() => runSpin(val, duration));
            });
        };

        const zoomAnim = Animated.loop(
            Animated.sequence([
                Animated.timing(zoom, {
                    toValue: 1.3,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(zoom, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
        );

        runSpin(spin, 2500);
        runSpin(spin2, 2200);
        runSpin(spin3, 2000);
        zoomAnim.start();

        return () => {
            active = false;
            spin.stopAnimation();
            spin2.stopAnimation();
            spin3.stopAnimation();
            zoomAnim.stop();
        };
    }, [spin, spin2, spin3, zoom]);

    const r1 = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
    const r2 = spin2.interpolate({ inputRange: [0, 1], outputRange: ["360deg", "0deg"] });
    const r3 = spin3.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

    const onStart = () => {
        if (!canCall(plan, callsData?.callsToday)) {
            return alert("You have no more calls today. Upgrade your plan for more!");
        }
        if (callsData?.callsToday === 3) {
            handleReview();
        }
        router.push({ pathname: "/(protected)/videocall", params: { id: 1 } });
    };

    return (
        <View style={gs.container}>
            <View style={styles.grid}>
                <InfiniteColumn imgs={leftBase} duration={LEFT_DURATION} />
                <InfiniteColumn imgs={rightBase} duration={RIGHT_DURATION} />
            </View>

            <View style={styles.bottomIndicator} pointerEvents="none">
                <View style={styles.indicatorPill}>
                    <Text style={styles.indicatorText}>
                        {callsData?.callsToday}/{CONSTANTS.PLANS[plan].maxCalls}
                    </Text>
                </View>
            </View>

            <View style={styles.centerWrap} pointerEvents="box-none">
                <Animated.View
                    style={[styles.ring, styles.ring1, { transform: [{ rotate: r1 }] }]}
                />
                <Animated.View
                    style={[styles.ring, styles.ring2, { transform: [{ rotate: r2 }] }]}
                />
                <Animated.View
                    style={[styles.ring, styles.ring3, { transform: [{ rotate: r3 }] }]}
                />

                <Pressable onPress={onStart} style={styles.startBtn}>
                    <Animated.View style={{ transform: [{ scale: zoom }] }}>
                        <Heart size={50} color={theme.white} />
                    </Animated.View>
                </Pressable>
            </View>
        </View>
    );
}

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        grid: {
            flexDirection: "row",
            paddingHorizontal: PAD,
            paddingTop: 20,
            gap: GAP,
            overflow: "hidden",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        },
        centerWrap: {
            position: "absolute",
            left: 0,
            right: 0,
            top: "38%",
            alignItems: "center",
            justifyContent: "center",
        },
        startBtn: {
            width: 150,
            height: 150,
            borderRadius: 75,
            backgroundColor: theme.primary,
            alignItems: "center",
            justifyContent: "center",
            elevation: 6,
            shadowColor: theme.black,
            shadowOpacity: 0.25,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 6 },
        },
        ring: {
            position: "absolute",
            borderColor: theme.primary,
            borderRadius: 999,
            borderTopColor: theme.primary,
            borderRightColor: theme.primary,
            borderBottomColor: "transparent",
            borderLeftColor: "transparent",
        },
        ring1: { width: 210, height: 210, borderWidth: 10, opacity: 1 },
        ring2: { width: 260, height: 260, borderWidth: 6, opacity: 0.9 },
        ring3: { width: 320, height: 320, borderWidth: 4, opacity: 0.75 },
        bottomIndicator: {
            position: "absolute",
            bottom: 8,
            left: 0,
            right: 0,
            alignItems: "center",
        },
        indicatorPill: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 99,
            backgroundColor: theme.base + "80",
            elevation: 0.9,
        },
        indicatorText: {
            color: theme.white,
            fontWeight: "600",
        },
    });
