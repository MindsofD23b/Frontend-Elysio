import { Ionicons } from "@expo/vector-icons";
import { BtnText, Button } from "@/components/button";
import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { router } from "expo-router";

import { useTheme } from "@/app/theme/context";
import { colors } from "@/app/theme/theme";

export default function SettingsScreen() {
    const { theme, setTheme } = useTheme();

    const mutedText = withAlpha(theme.text, 0.55);
    const divider = withAlpha(theme.text, 0.15);
    const iconColor = withAlpha(theme.text, 0.9);

    const isLight = theme.background === colors.light.background;

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
            <View style={styles.container}>
                <Text style={[styles.title, { marginTop: 20, color: theme.text }]}>
                    Settings
                </Text>

                <View style={styles.profileWrap}>
                    <Image
                        source={{
                            uri: "https://images.unsplash.com/photo-1517849845537-4d257902454a",
                        }}
                        style={styles.avatar}
                    />
                    <Text style={[styles.name, { color: theme.text }]}>Lara Gut</Text>
                    <Text style={[styles.email, { color: mutedText }]}>
                        Lara.gut@example.com
                    </Text>
                </View>

                <View style={styles.list}>
                    <MenuRow
                        icon="person-outline"
                        label="Personal Details"
                        divider={divider}
                        iconColor={iconColor}
                        textColor={theme.text}
                        onPress={() => router.push("/settings/personaldetails")}
                    />
                    <MenuRow
                        icon="heart-outline"
                        label="Interests"
                        divider={divider}
                        iconColor={iconColor}
                        textColor={theme.text}
                        onPress={() => router.push("/settings/interests")}
                    />
                    <MenuRow
                        icon="globe-outline"
                        label="Terms and Conditions"
                        divider={divider}
                        iconColor={iconColor}
                        textColor={theme.text}
                    />
                    <MenuRow
                        icon="notifications-outline"
                        label="Privacy & Policy"
                        divider={divider}
                        iconColor={iconColor}
                        textColor={theme.text}
                    />
                    <MenuRow
                        icon="eye-outline"
                        label="About us"
                        divider={divider}
                        iconColor={iconColor}
                        textColor={theme.text}
                    />
                </View>

                <View style={styles.modeRow}>
                    <Pressable
                        style={styles.modeItem}
                        onPress={() => setTheme(colors.light)}
                    >
                        <Ionicons
                            name="sunny-outline"
                            size={20}
                            color={isLight ? theme.primary : mutedText}
                        />
                        <Text style={{ color: isLight ? theme.primary : mutedText }}>
                            Lightmode
                        </Text>
                    </Pressable>

                    <Pressable
                        style={styles.modeItem}
                        onPress={() => setTheme(colors.dark)}
                    >
                        <Ionicons
                            name="moon-outline"
                            size={20}
                            color={!isLight ? theme.primary : mutedText}
                        />
                        <Text style={{ color: !isLight ? theme.primary : mutedText }}>
                            Darkmode
                        </Text>
                    </Pressable>
                </View>

                <Button
                    style={{ marginTop: "auto", marginBottom: 30 }}
                    onPress={() => {}}
                >
                    <BtnText>Log Out</BtnText>
                </Button>
            </View>
        </SafeAreaView>
    );
}
function MenuRow({
    icon,
    label,
    divider,
    iconColor,
    textColor,
    onPress,
}: {
    icon: any;
    label: string;
    divider: string;
    iconColor: string;
    textColor: string;
    onPress?: () => void;
}) {
    return (
        <Pressable onPress={onPress} style={[styles.row, { borderBottomColor: divider }]}>
            <View style={styles.rowLeft}>
                <Ionicons name={icon} size={20} color={iconColor} />
                <Text style={[styles.rowLabel, { color: textColor }]}>{label}</Text>
            </View>
        </Pressable>
    );
}

function withAlpha(hex: string, alpha: number) {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

const styles = StyleSheet.create({
    safe: { flex: 1 },

    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
        justifyContent: "space-between",
    },

    title: {
        paddingTop: 20,
        fontSize: 26,
        fontWeight: "800",
        textAlign: "center",
    },

    profileWrap: {
        alignItems: "center",
        marginTop: 10,
    },

    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
    },

    name: {
        fontSize: 22,
        fontWeight: "700",
        marginTop: 6,
    },

    email: {
        fontSize: 13,
        marginTop: 2,
    },

    list: {
        marginTop: 10,
    },

    row: {
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },

    rowLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },

    rowLabel: {
        fontSize: 16,
        fontWeight: "600",
    },

    modeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },

    modeItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
});
