import { createT } from "@/i18n";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { Settings } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme/context";

const t = createT("update");

interface UpdateScreenProps {
    duration?: string;
}

export default function UpdateScreen({ duration }: UpdateScreenProps) {
    const { theme } = useTheme();
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(progressAnim, {
                    toValue: 1,
                    duration: 1200,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(progressAnim, {
                    toValue: 0,
                    duration: 1200,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    const opacity = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.4, 1],
    });

    const s = styles(theme);

    return (
        <View style={s.container}>
            <Animated.View style={[s.icon, { opacity }]}>
                <Text style={s.iconText}>
                    <Settings color={theme.primary} />
                </Text>
            </Animated.View>
            <Text style={s.title}>{t("title")}</Text>
            <Text style={s.body}>{t("body")}</Text>
            <View style={s.durationBox}>
                <Text style={s.durationLabel}>{t("estimatedTime")}</Text>
                <Text style={s.durationValue}>{duration ?? t("unknown")}</Text>
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
        icon: {
            width: 64,
            height: 64,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 8,
        },
        iconText: {
            fontSize: 48,
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
        durationBox: {
            marginTop: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: theme.card,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 12,
        },
        durationLabel: {
            fontSize: 14,
            color: theme.grayscale,
        },
        durationValue: {
            fontSize: 18,
            fontWeight: "700",
            color: theme.primary,
        },
    });
