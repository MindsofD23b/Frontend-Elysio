import { useTheme } from "@/lib/theme/context";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress?: () => void;
};

export function CategoryCard({ label, icon, onPress }: Props) {
    const { theme } = useTheme();
    const s = makeStyles(theme);

    return (
        <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.8}>
            <Ionicons name={icon} size={26} color={theme.primary} />
            <Text style={s.label}>{label}</Text>
        </TouchableOpacity>
    );
}

const makeStyles = (theme: any) =>
    StyleSheet.create({
        card: {
            flex: 1,
            backgroundColor: theme.cardBg,
            borderRadius: 16,
            paddingVertical: 18,
            alignItems: "center",
            gap: 8,
            borderWidth: 1,
            borderColor: theme.cardBgDeep,
        },
        label: { color: "#aaa", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
    });
