import { StyleSheet } from "react-native";
import { Theme } from "./theme";

export const makeGlobalStyles = (theme: Theme) =>
    StyleSheet.create({
        // Typography
        h1: { fontSize: 30, fontWeight: "bold", color: theme.text },
        h2: { fontSize: 24, fontWeight: "bold", color: theme.text },
        bodyText: { fontSize: 16, color: theme.text },
        mutedText: { fontSize: 14, color: theme.accent },

        // Buttons
        btn: {
            width: "100%",
            padding: 12,
            borderRadius: 8,
            alignItems: "center" as const,
        },
        btnDefault: { backgroundColor: theme.primary },
        btnText: { fontSize: 16 },
        btnTextDefault: { color: theme.white },
        btnTextOutline: { color: theme.primary },
        btnDisabled: { backgroundColor: theme.primary + "80" },
        btnOutline: {
            borderWidth: 1,
            borderColor: theme.primary,
            padding: 12,
            borderRadius: 8,
        },
        btnOutlineText: { color: theme.primary, fontSize: 16 },

        // Layout
        container: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            backgroundColor: theme.background,
        },
        card: { backgroundColor: theme.accent, borderRadius: 12, padding: 16 },
        row: { flexDirection: "row" as const, alignItems: "center" as const },
    });
