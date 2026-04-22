import { useTheme } from "@/lib/theme/context";
import { LucideIcon } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

type Props = {
    heading: string;
    text: string;
    icon?: LucideIcon;
};

export function TipSection({ heading, text, icon: Icon }: Props) {
    const { theme } = useTheme();

    return (
        <View
            style={[
                styles.card,
                { backgroundColor: theme.text + "08", borderColor: theme.text + "12" },
            ]}
        >
            <View style={styles.headingRow}>
                {Icon && <Icon size={16} color={theme.primary} strokeWidth={2.5} />}
                <Text style={[styles.heading, { color: theme.primary }]}>{heading}</Text>
            </View>
            <Text style={[styles.text, { color: theme.text + "CC" }]}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        gap: 10,
    },
    headingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    heading: {
        fontSize: 13,
        fontWeight: "800",
        letterSpacing: 0.8,
        textTransform: "uppercase",
    },
    text: {
        fontSize: 15,
        lineHeight: 24,
        fontWeight: "400",
    },
});
