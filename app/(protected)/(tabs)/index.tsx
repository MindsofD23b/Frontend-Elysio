import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useTheme } from "@/app/theme/context";
import { Theme } from "@/app/theme/theme";
import { Heart } from "lucide-react-native";

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
        uri: "https://images.unsplash.com/photo-1513682121497-80211f36a7d3?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        h: 150,
    },
    {
        id: "l2",
        col: "left",
        uri: "https://images.unsplash.com/photo-1604440401661-8f6f07c285a2?q=80&w=663&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        h: 220,
    },
    {
        id: "l3",
        col: "left",
        uri: "https://images.unsplash.com/photo-1601887389937-0b02c26b602c?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        h: 160,
    },
    {
        id: "l4",
        col: "left",
        uri: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        h: 210,
    },

    // right column
    {
        id: "r1",
        col: "right",
        uri: "https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        h: 180,
    },
    {
        id: "r2",
        col: "right",
        uri: "https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?auto=format&fit=crop&w=800&q=80",
        h: 140,
    },
    {
        id: "r3",
        col: "right",
        uri: "https://images.unsplash.com/photo-1496307653780-42ee777d4833?auto=format&fit=crop&w=800&q=80",
        h: 240,
    },
    {
        id: "r4",
        col: "right",
        uri: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
        h: 120,
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
    }, []);
    const [count, setCount] = useState(10);
    const maxCount = 10;

    const onStart = () => {
        setCount((prev) => (prev > 0 ? prev - 1 : 0));
        // router.push({ pathname: "/(protected)/videocall", params: { id: 1 } });
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
    }, []);
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
            left: "48%",
            width: 6,
            height: 18,
            borderRadius: 99,
            backgroundColor: theme.primary,
            opacity: 0.9,
        },
    });
//inifinte loop cycle made with claude.ai
