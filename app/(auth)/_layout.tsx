import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/lib/auth/AuthProvider"
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {

    const { isAuthenticated, isLoading} = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center"}}>
                <ActivityIndicator />
            </View>
        )
    }

    if (isAuthenticated) {
        return <Redirect href="/(protected)/(tabs)" />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}
