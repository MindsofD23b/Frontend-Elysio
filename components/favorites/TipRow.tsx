import { useTheme } from "@/lib/theme/context";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconBg: string;
    onPress?: () => void;
};

export function TipRow({ title, subtitle, icon, iconBg, onPress }: Props) {
    const { theme } = useTheme();
    const s = makeStyles(theme);

    return (
        <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.8}>
            <View style={[s.iconBox, { backgroundColor: iconBg + "33" }]}>
                <Ionicons name={icon} size={20} color={iconBg} />
            </View>
            <View style={s.textCol}>
                <Text style={s.title}>{title}</Text>
                <Text style={s.subtitle}>{subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#555" />
        </TouchableOpacity>
    );
}

const makeStyles = (theme: any) =>
    StyleSheet.create({
        row: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            backgroundColor: theme.cardBg,
            borderRadius: 14,
            padding: 14,
        },
        iconBox: {
            width: 42,
            height: 42,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
        },
        textCol: { flex: 1, gap: 2 },
        title: { color: theme.white, fontWeight: "800", fontSize: 14 },
        subtitle: { color: "#aaa", fontSize: 12, lineHeight: 16 },
    });
