import { useTheme } from "@/lib/theme/context";
import { Theme } from "@/lib/theme/theme";
import { WifiOff } from "lucide-react-native";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NoInternetScreen() {
    const { theme } = useTheme();
    const s = makeStyle(theme);

    return (
        <SafeAreaView style={s.root}>
            <View style={s.card}>
                <WifiOff size={48} color={theme.primary} />
                <Text style={s.title}>No Connection</Text>
                <Text style={s.subtitle}>
                    Please check your internet connection and try again.
                </Text>
            </View>
        </SafeAreaView>
    );
}

const makeStyle = (theme: Theme) =>
    StyleSheet.create({
        root: {
            flex: 1,
            backgroundColor: theme.background,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 32,
        },
        card: { alignItems: "center", justifyContent: "center", gap: 20 },
        icon: { fontSize: 48 },
        title: {
            color: theme.text,
            fontSize: 22,
            fontWeight: "700",
            textAlign: "center",
            letterSpacing: -0.3,
        },
        subtitle: {
            color: "#888",
            fontSize: 15,
            textAlign: "center",
            lineHeight: 22,
        },
    });
