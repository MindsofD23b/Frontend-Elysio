import { Redirect, router, Stack } from "expo-router";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useTheme } from "@/lib/theme/context";
import { useServerStatus } from "@/lib/ServerStatusContext";
import { CloudOff } from "lucide-react-native";

export default function ProtectedLayout() {
    const { isAuthenticated, isLoading } = useAuth();
    const { theme } = useTheme();
    const serverStatus = useServerStatus();
    const isOffline = serverStatus === "down";

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
        <View style={{ flex: 1 }}>
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
                        contentStyle: { backgroundColor: theme.cardBg },
                    }}
                />
            </Stack>

            {isOffline && (
                <Pressable
                    style={styles.pillWrap}
                    onPress={() => router.push("/(protected)/info")}
                >
                    <View style={[styles.shadow1, { shadowColor: theme.orange }]}>
                        <View style={[styles.shadow2, { shadowColor: theme.orange }]}>
                            <View
                                style={[styles.pill, { backgroundColor: theme.orange }]}
                            >
                                <CloudOff size={14} color={theme.white} />
                                <Text style={[styles.pillText, { color: theme.white }]}>
                                    Offline
                                </Text>
                            </View>
                        </View>
                    </View>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    pillWrap: {
        position: "absolute",
        top: 8,
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 999,
        pointerEvents: "box-none",
    },
    shadow1: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 12,
    },
    shadow2: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    pill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
    },
    pillText: { fontWeight: "700", fontSize: 13 },
});
