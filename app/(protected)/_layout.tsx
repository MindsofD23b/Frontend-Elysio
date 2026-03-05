import { Stack } from "expo-router";

export default function RegisterLayout() {
    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
    );
}
