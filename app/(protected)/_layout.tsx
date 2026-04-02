import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function ProtectedLayout() {
    const { isAuthenticated, isLoading } = useAuth();

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
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: StyleSheet.flatten({ flex: 1 }),
            }}
        />
    );
}
