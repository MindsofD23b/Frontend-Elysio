import { StyleSheet } from "react-native";
import { Theme } from "./theme";

export const makeGlobalStyles = (theme: Theme) =>
    StyleSheet.create({
        // Typography
        h1: { fontSize: 32, fontWeight: "bold", color: theme.text },
        h2: { fontSize: 24, fontWeight: "bold", color: theme.text },
        bodyText: { fontSize: 16, color: theme.text },
        mutedText: { fontSize: 14, color: theme.accent },

        // Buttons
        btn: {
            backgroundColor: theme.primary,
            padding: 12,
            borderRadius: 8,
            alignItems: "center" as const,
        },
        btnText: { color: theme.text, fontWeight: "bold", fontSize: 16 },
        btnOutline: {
            borderWidth: 1,
            borderColor: theme.primary,
            padding: 12,
            borderRadius: 8,
        },

        // Layout
        container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16, backgroundColor: theme.background },
        card: { backgroundColor: theme.accent, borderRadius: 12, padding: 16 },
        row: { flexDirection: "row" as const, alignItems: "center" as const },
    });