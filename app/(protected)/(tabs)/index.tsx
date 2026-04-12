import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    Pressable,
    StyleSheet,
    View,
    Text,
} from "react-native";
import { useTheme } from "@/lib/theme/context";
import { Theme } from "@/lib/theme/theme";
import { router } from "expo-router";
import { canCall } from "@/lib/premium/canCall";
import { CONSTANTS, PlanType } from "@/lib/constants";
import { Heart } from "lucide-react-native";
import { useAuthFetch } from "@/hooks/useAuthFetch";
// TODO: Implement plan based constants
const user = {
    plan: PlanType.FREE,
};

const { width, height } = Dimensions.get("window");
const H_SCALE = height / 800;
const GAP = 28;
const PAD = 16;
const COL_W = (width - PAD * 2 - GAP) / 2;
const images = [
    // left column
    {
        id: "l1",
        col: "left",
        uri: "https://images.unsplash.com/photo-1591969851586-adbbd4accf81?q=80&w=687&auto=format&fit=crop",
        h: 150,
    },
    {
        id: "l2",
        col: "left",
        uri: "https://images.unsplash.com/photo-1525206809752-65312b959c88?q=80&w=687&auto=format&fit=crop",
        h: 220,
    },
    {
        id: "l3",
        col: "left",
        uri: "https://images.unsplash.com/photo-1566759996874-04d713cc224a?q=80&w=687&auto=format&fit=crop",
        h: 160,
    },
    {
        id: "l4",
        col: "left",
        uri: "https://images.unsplash.com/photo-1541679368093-5c967ac6de11?q=80&w=687&auto=format&fit=crop",
        h: 210,
    },
    {
        id: "l5",
        col: "left",
        uri: "https://images.unsplash.com/photo-1510276113764-7ac28415a9ec?q=80&w=1170&auto=format&fit=crop",
        h: 180,
    },
    {
        id: "l6",
        col: "left",
        uri: "https://images.unsplash.com/photo-1469989011449-f7b46079781c?q=80&w=687&auto=format&fit=crop",
        h: 200,
    },
    {
        id: "l7",
        col: "left",
        uri: "https://images.unsplash.com/photo-1501901609772-df0848060b33?q=80&w=687&auto=format&fit=crop",
        h: 170,
    },
    {
        id: "l8",
        col: "left",
        uri: "https://images.unsplash.com/photo-1649289787860-ecad6fad173f?q=80&w=687&auto=format&fit=crop",
        h: 230,
    },
    {
        id: "l9",
        col: "left",
        uri: "https://images.unsplash.com/photo-1583185136875-8ac7cae3ef13?q=80&w=687&auto=format&fit=crop",
        h: 155,
    },
    {
        id: "l10",
        col: "left",
        uri: "https://images.unsplash.com/photo-1512790941078-1158a9cc3255?q=80&w=685&auto=format&fit=crop",
        h: 195,
    },

    // right column
    {
        id: "r1",
        col: "right",
        uri: "https://images.unsplash.com/photo-1622503958522-9f847e7e18de?q=80&w=687&auto=format&fit=crop",
        h: 180,
    },
    {
        id: "r2",
        col: "right",
        uri: "https://images.unsplash.com/photo-1513521523607-ba30a1159755?q=80&w=1170&auto=format&fit=crop",
        h: 140,
    },
    {
        id: "r3",
        col: "right",
        uri: "https://images.unsplash.com/photo-1624228652393-eab1721b1899?q=80&w=687&auto=format&fit=crop",
        h: 240,
    },
    {
        id: "r4",
        col: "right",
        uri: "https://images.unsplash.com/photo-1481689481678-374244adae6d?q=80&w=687&auto=format&fit=crop",
        h: 120,
    },
    {
        id: "r5",
        col: "right",
        uri: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=687&auto=format&fit=crop",
        h: 200,
    },
    {
        id: "r6",
        col: "right",
        uri: "https://images.unsplash.com/photo-1580250864656-cd501faa9c76?q=80&w=687&auto=format&fit=crop",
        h: 160,
    },
    {
        id: "r7",
        col: "right",
        uri: "https://images.unsplash.com/photo-1513521465117-afd07b1ce6dc?q=80&w=687&auto=format&fit=crop",
        h: 210,
    },
    {
        id: "r8",
        col: "right",
        uri: "https://images.unsplash.com/photo-1561240055-102e7eaa2961?q=80&w=687&auto=format&fit=crop",
        h: 175,
    },
    {
        id: "r9",
        col: "right",
        uri: "https://images.unsplash.com/photo-1567888818950-737cde12f04c?q=80&w=687&auto=format&fit=crop",
        h: 145,
    },
    {
        id: "r10",
        col: "right",
        uri: "https://images.unsplash.com/photo-1611067460204-e43ec4a2efa3?q=80&w=1170&auto=format&fit=crop",
        h: 220,
    },
];
function calcColHeight(imgs: typeof images) {
    return imgs.reduce((sum, img) => sum + Math.round(img.h * H_SCALE) + GAP, 0);
}
function Tile({ uri, h }: { uri: string; h: number }) {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    return (
        <View style={[styles.tile, { height: Math.round(h * H_SCALE), width: COL_W }]}>
            <Image
                source={{ uri }}
                style={styles.tileImg}
                placeholder={
                    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj["
                }
                contentFit="cover"
                transition={1000}
            />
            <View />
        </View>
    );
}
function InfiniteColumn({
    imgs,
    drift,
    colHeight,
}: {
    imgs: typeof images;
    drift: Animated.Value;
    colHeight: number;
}) {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const translateY = drift.interpolate({
        inputRange: [0, colHeight],
        outputRange: [0, -colHeight],
    });
    return (
        <Animated.View style={[styles.col, { transform: [{ translateY }] }]}>
            {[...imgs, ...imgs].map((img, idx) => (
                <Tile key={`${img.id}-${idx}`} uri={img.uri} h={img.h} />
            ))}
        </Animated.View>
    );
}

export default function Index() {
    const { theme, gs } = useTheme();
    const [callsData, , , refetch] = useAuthFetch<{ callsToday: number }>(
        "/users/calls-left",
        undefined,
        { manual: true },
    );

    console.log(callsData);

    useEffect(() => {
        refetch().catch(() => {});
    }, [refetch]);
    const styles = makeStyles(theme);

    const leftBase = images.filter((i) => i.col === "left");
    const rightBase = images.filter((i) => i.col === "right");

    const leftColHeight = calcColHeight(leftBase);
    const rightColHeight = calcColHeight(rightBase);

    const driftL = useRef(new Animated.Value(0)).current;
    const driftR = useRef(new Animated.Value(0)).current;

    const SPEED_L = 7000;
    const SPEED_R = 9000;

    useEffect(() => {
        let cancelledL = false;
        let cancelledR = false;

        const runL = () => {
            driftL.setValue(0);
            Animated.timing(driftL, {
                toValue: leftColHeight,
                duration: SPEED_L,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (finished && !cancelledL) runL();
            });
        };

        const runR = () => {
            driftR.setValue(0);
            Animated.timing(driftR, {
                toValue: rightColHeight,
                duration: SPEED_R,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (finished && !cancelledR) runR();
            });
        };

        runL();
        runR();

        return () => {
            cancelledL = true;
            cancelledR = true;
            driftL.stopAnimation();
            driftR.stopAnimation();
        };
    }, [driftL, driftR, leftColHeight, rightColHeight]);

    const [count, setCount] = useState(0);

    const onStart = () => {
        // TODO: Implement i18n here
        if (!canCall(user.plan, count)) {
            return user.plan === PlanType.FREE
                ? alert("Upgrade to Paid plan!")
                : alert("You have no more Calls to day");
        }

        setCount((prev) => prev + 1);
        router.push({ pathname: "/(protected)/videocall", params: { id: 1 } });
    };

    const spin = useRef(new Animated.Value(0)).current;
    const spin2 = useRef(new Animated.Value(0)).current;
    const spin3 = useRef(new Animated.Value(0)).current;

    const zoom = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        let cancelled = false;

        const runSpin1 = () => {
            spin.setValue(0);
            Animated.timing(spin, {
                toValue: 1,
                duration: 2500,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (!finished || cancelled) return;
                runSpin1();
            });
        };

        const runSpin2 = () => {
            spin2.setValue(0);
            Animated.timing(spin2, {
                toValue: 1,
                duration: 2200,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (!finished || cancelled) return;
                runSpin2();
            });
        };

        const runSpin3 = () => {
            spin3.setValue(0);
            Animated.timing(spin3, {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (!finished || cancelled) return;
                runSpin3();
            });
        };

        Animated.loop(
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
        ).start();

        runSpin1();
        runSpin2();
        runSpin3();

        return () => {
            cancelled = true;
            spin.stopAnimation();
            spin2.stopAnimation();
            spin3.stopAnimation();
        };
    }, [spin, spin2, spin3, zoom]);
    //SPIN
    const r1 = spin.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });
    const r2 = spin2.interpolate({
        inputRange: [0, 1],
        outputRange: ["360deg", "0deg"],
    });
    const r3 = spin3.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });
    return (
        <View style={gs.container}>
            {/* Grid */}
            <View style={styles.grid}>
                <InfiniteColumn
                    imgs={leftBase}
                    drift={driftL}
                    colHeight={leftColHeight}
                />
                <InfiniteColumn
                    imgs={rightBase}
                    drift={driftR}
                    colHeight={rightColHeight}
                />
            </View>

            <View style={styles.bottomIndicator} pointerEvents="none">
                <View style={styles.indicatorPill}>
                    <Text style={styles.indicatorText}>
                        {callsData?.callsToday}/{CONSTANTS.PLANS[user.plan].maxCalls}
                    </Text>
                </View>
            </View>

            <View style={styles.centerWrap} pointerEvents="box-none">
                {/* Rings */}
                <Animated.View
                    style={[styles.ring, styles.ring1, { transform: [{ rotate: r1 }] }]}
                />
                <Animated.View
                    style={[styles.ring, styles.ring2, { transform: [{ rotate: r2 }] }]}
                />
                <Animated.View
                    style={[styles.ring, styles.ring3, { transform: [{ rotate: r3 }] }]}
                />

                {/* Button */}
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

        col: {
            flex: 1,
            gap: GAP,
        },

        tile: {
            borderRadius: 16,
            overflow: "hidden",
            backgroundColor: theme.base + "50",
        },
        tileImg: {
            width: "100%",
            height: "100%",
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
//inifinte loop cycle made with claude.ai
