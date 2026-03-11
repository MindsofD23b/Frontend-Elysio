import { useTheme } from "@/app/theme/context";
import { Theme } from "@/app/theme/theme";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

interface ISelectProps {
    activeColor?: string;
    color?: string;
    label: string;
    checked: boolean;
    onChange?: (newVal: boolean) => void;
}

export default function Select({
    color,
    activeColor,
    label,
    checked,
    onChange,
}: ISelectProps) {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const boxStyle = useAnimatedStyle(() => ({
        backgroundColor: withTiming(checked ? theme.primary : theme.background, {
            duration: 250,
        }),
        borderColor: withTiming(checked ? theme.primary : theme.primary, {
            duration: 250,
        }),
    }));

    const dotStyle = useAnimatedStyle(() => ({
        opacity: withTiming(checked ? 1 : 0, { duration: 250 }),
        transform: [{ scale: withTiming(checked ? 1 : 0.5, { duration: 150 }) }],
        backgroundColor: withTiming(checked ? theme.white : theme.background, {
            duration: 250,
        }),
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
            backgroundColor: "#fff",
        },
        boxChecked: {
            backgroundColor: theme.primary,
            borderColor: theme.primary,
        },
        checkmark: {
            color: "#fff",
            fontSize: 14,
            width: 12,
            height: 12,
            borderRadius: 100,
        },
        label: {
            marginLeft: 12,
            fontSize: 16,
            color: "#333",
        },
    });
