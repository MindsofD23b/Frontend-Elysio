import { Redirect, router, Stack } from "expo-router";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { GlassView } from "expo-glass-effect";
import { X } from "lucide-react-native";
import { useTheme } from "@/lib/theme/context";

export default function ProtectedLayout() {
    const { isAuthenticated, isLoading } = useAuth();
    const { theme } = useTheme();

    usePushNotifications();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator />
            </View>
        );
    }

    if (!isAuthenticated) {
        return <Redirect href="/login" />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="info"
                options={{
                    presentation: "formSheet",
                    headerShown: false,
                    sheetAllowedDetents: [0.5, 1.0],
                    sheetGrabberVisible: true,
                    sheetExpandsWhenScrolledToEdge: true,
                    sheetLargestUndimmedDetentIndex: "none",
                    contentStyle: { backgroundColor: theme.gray },
                }}
            />
        </Stack>
    );
}
