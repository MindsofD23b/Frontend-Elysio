import { BtnText, Button } from "@/components/button";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/lib/theme/context";
import { Eye, Globe, Heart, MessageCircle, Sun, User } from "lucide-react-native";
import { Href, router } from "expo-router";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function SettingsScreen() {
    const { gs, theme } = useTheme();

    const { logout } = useAuth();

    const mutedText = withAlpha(theme.text, 0.55);
    const divider = withAlpha(theme.text, 0.15);
    const iconColor = withAlpha(theme.text, 0.9);

    const handleLogout = async () => {
        await logout();
        router.replace("/login")
    }

    return (
        <View style={gs.container}>
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
                    icon={User}
                    label="Personal Details"
                    divider={divider}
                    iconColor={iconColor}
                    textColor={theme.text}
                    href="/settings/apperance"
                />
                <MenuRow
                    icon={Heart}
                    label="Interests"
                    divider={divider}
                    iconColor={iconColor}
                    textColor={theme.text}
                    href="/settings/apperance"
                />
                <MenuRow
                    icon={Globe}
                    label="Terms and Conditions"
                    divider={divider}
                    iconColor={iconColor}
                    textColor={theme.text}
                    href="/settings/apperance"
                />
                <MenuRow
                    icon={MessageCircle}
                    label="Privacy & Policy"
                    divider={divider}
                    iconColor={iconColor}
                    textColor={theme.text}
                    href="/settings/apperance"
                />
                <MenuRow
                    icon={Eye}
                    label="About us"
                    divider={divider}
                    iconColor={iconColor}
                    textColor={theme.text}
                    href="/settings/apperance"
                />
                <MenuRow
                    icon={Sun}
                    label="Apperance"
                    divider={divider}
                    iconColor={iconColor}
                    textColor={theme.text}
                    href="/settings/apperance"
                />
            </View>

            <Button style={{ marginTop: "auto" }} onPress={handleLogout}>
                <BtnText>Log Out</BtnText>
            </Button>
        </View>
    );
}

function MenuRow({
    icon: Icon,
    label,
    divider,
    iconColor,
    textColor,
    href,
}: {
    icon: React.ElementType;
    label: string;
    divider: string;
    iconColor: string;
    textColor: string;
    href: Href;
}) {
    const { theme } = useTheme();

    return (
        <Pressable
            onPress={() => router.push(href)}
            style={({ pressed }) => [
                styles.row,
                { borderBottomColor: divider, width: "100%" },
                pressed && { backgroundColor: theme.base + "0A", borderRadius: 16 },
            ]}
        >
            <View style={styles.rowLeft}>
                <Icon size={20} color={iconColor} />
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
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
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
        width: "100%",
        marginTop: 10,
    },

    row: {
        width: "100%",
        paddingVertical: 14,
        paddingHorizontal: 7,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },

    rowLeft: {
        width: "100%",
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
