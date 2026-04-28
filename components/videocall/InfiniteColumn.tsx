import { useEffect, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import Animated, {
    cancelAnimation,
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";
import { GAP } from "./homeConstants";
import { HomeImage } from "./homeImages";
import { Tile } from "./Tile";

interface Props {
    imgs: HomeImage[];
    duration: number;
}

export function InfiniteColumn({ imgs, duration }: Props) {
    const [copyHeight, setCopyHeight] = useState(0);
    const translateY = useSharedValue(0);

    useEffect(() => {
        cancelAnimation(translateY);
        if (copyHeight <= 0) return;
        const cycle = copyHeight + GAP;
        translateY.value = 0;
        translateY.value = withRepeat(
            withTiming(-cycle, {
                duration,
                easing: Easing.linear,
            }),
            -1,
            false,
        );
        return () => cancelAnimation(translateY);
    }, [translateY, copyHeight, duration]);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const onCopyLayout = (e: LayoutChangeEvent) => {
        const h = e.nativeEvent.layout.height;
        if (h > 0 && h !== copyHeight) setCopyHeight(h);
    };

    return (
        <Animated.View style={[styles.col, animStyle]}>
            <View style={styles.copy} onLayout={onCopyLayout}>
                {imgs.map((img, idx) => (
                    <Tile key={`a-${img.id}-${idx}`} uri={img.uri} h={img.h} />
                ))}
            </View>
            <View style={styles.copy}>
                {imgs.map((img, idx) => (
                    <Tile key={`b-${img.id}-${idx}`} uri={img.uri} h={img.h} />
                ))}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    col: {
        flex: 1,
        gap: GAP,
    },
    copy: {
        gap: GAP,
    },
});
