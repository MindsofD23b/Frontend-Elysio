import { useTheme } from "@/lib/theme/context";
import { Href, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function MenuRow({
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

const styles = StyleSheet.create({
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
});
