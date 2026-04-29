import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ActivityIndicator, View } from "react-native";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function ProtectedLayout() {
    const { isAuthenticated, isLoading } = useAuth();

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
                    name="datePickerModal"
                    options={{
                        headerShown: false,
                        presentation: "formSheet",
                        gestureEnabled: true,
                        sheetGrabberVisible: true,
                        sheetAllowedDetents: [0.5, 1],
                        sheetInitialDetentIndex: 0,
                    }}
                />
            </Stack>
        </View>
    );
}
