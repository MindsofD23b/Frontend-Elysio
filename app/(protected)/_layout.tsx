import { Stack } from "expo-router";

export default function ProtectedLayout() {
    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="videocall" options={{ headerShown: true }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
        </Stack>
    );
}
