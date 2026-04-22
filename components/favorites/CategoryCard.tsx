// Made with the help of Claude.ai and ChatGPT

import { useTheme } from "@/lib/theme/context";
import { LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, Text } from "react-native";

type CategoryGridCardProps = {
    label: string;
    icon: LucideIcon;
    onPress: () => void;
};

export function CategoryGridCard({ label, icon: Icon, onPress }: CategoryGridCardProps) {
    const { theme } = useTheme();

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.card,
                {
                    backgroundColor: theme.background,
                    borderColor: theme.text + "18",
                },
                pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
            ]}
        >
            <Icon size={28} color={theme.primary} strokeWidth={2} />
            <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: 18,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        paddingHorizontal: 8,
        gap: 10,
    },
    label: {
        fontSize: 12,
        fontWeight: "700",
        textAlign: "center",
        letterSpacing: 0.2,
    },
});
