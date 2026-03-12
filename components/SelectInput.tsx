import { useTheme } from "@/app/theme/context";
import { Theme } from "@/app/theme/theme";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

interface ISelectProps {
    label?: string;
    checked: boolean;
    onChange?: (newVal: boolean) => void;
}

export default function Select({ label, checked, onChange }: ISelectProps) {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const progress = useSharedValue(checked ? 1 : 0);

    useEffect(() => {
        progress.value = withTiming(checked ? 1 : 0, { duration: 250 });
    }, [checked]);

    const boxStyle = useAnimatedStyle(() => ({
        backgroundColor: checked ? theme.primary : theme.card + "FA",
        borderColor: theme.primary,
    }));

    const dotStyle = useAnimatedStyle(() => ({
        opacity: withTiming(checked ? 1 : 0, { duration: 250 }),
        transform: [{ scale: withTiming(checked ? 1 : 0.5, { duration: 150 }) }],
        backgroundColor: theme.white ?? theme.card + "FA",
    }));

    return (
        <TouchableOpacity
            style={styles.row}
            onPress={() => onChange?.(!checked)}
            activeOpacity={0.7}
        >
            <Animated.View style={[styles.box, boxStyle]}>
                <Animated.View style={[styles.checkmark, dotStyle]} />
            </Animated.View>
            {label ? <Text style={styles.label}>{label}</Text> : null}
        </TouchableOpacity>
    );
}

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        row: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
        },
        box: {
            width: 24,
            height: 24,
            borderRadius: 100,
            borderWidth: 2,
            borderColor: theme.primary,
            alignItems: "center",
            justifyContent: "center",
        },
        checkmark: {
            width: 12,
            height: 12,
            borderRadius: 100,
        },
        label: {
            marginLeft: 12,
            fontSize: 16,
            color: theme.primary,
        },
    });
