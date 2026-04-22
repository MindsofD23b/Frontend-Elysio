// Made with the help of Claude.ai and ChatGPT

import { useTheme } from "@/lib/theme/context";
import { LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type DateIdea = {
    title: string;
    desc: string;
    price: string;
    duration: string;
};

type CategoryGridCardProps = {
    label: string;
    icon: LucideIcon;
    onPress: () => void;
    ideas?: DateIdea[];
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

export function DateIdeaList({ ideas }: { ideas: DateIdea[] }) {
    const { theme } = useTheme();

    return (
        <View style={listStyles.container}>
            {ideas.map((idea, i) => (
                <View
                    key={i}
                    style={[listStyles.row, { borderColor: theme.text + "12" }]}
                >
                    <View style={listStyles.info}>
                        <Text style={[listStyles.title, { color: theme.text }]}>
                            {idea.title}
                        </Text>
                        <Text style={[listStyles.desc, { color: theme.text + "88" }]}>
                            {idea.desc}
                        </Text>
                    </View>
                    <View style={listStyles.meta}>
                        <Text style={[listStyles.price, { color: theme.primary }]}>
                            {idea.price}
                        </Text>
                        <Text style={[listStyles.duration, { color: theme.text + "66" }]}>
                            {idea.duration}
                        </Text>
                    </View>
                </View>
            ))}
        </View>
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

const listStyles = StyleSheet.create({
    container: { gap: 10 },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 12,
    },
    info: { flex: 1, gap: 3 },
    title: { fontSize: 14, fontWeight: "700" },
    desc: { fontSize: 12, lineHeight: 17 },
    meta: { alignItems: "flex-end", gap: 3 },
    price: { fontSize: 13, fontWeight: "700" },
    duration: { fontSize: 11 },
});
