import { Stack } from "expo-router";

export default function RegisterLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="withEmail" options={{ headerShown: false }} />
            <Stack.Screen name="withPhoneNumber" options={{ headerShown: false }} />
            <Stack.Screen name="sendVerificationEmail" options={{ headerShown: false }} />
            <Stack.Screen name="sendVerificationPhone" options={{ headerShown: false }} />
        </Stack>
    );
}