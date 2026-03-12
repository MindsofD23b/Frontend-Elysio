import { Stack } from "expo-router";

export default function RegisterLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="withEmail" options={{ headerShown: false }} />
            <Stack.Screen name="sendVerificationEmail" options={{ headerShown: false }} />
            <Stack.Screen name="sendVerificationPhone" options={{ headerShown: false }} />
            <Stack.Screen name="gender" options={{ headerShown: false }} />
            <Stack.Screen name="addProfilePicture" options={{ headerShown: false }} />
            <Stack.Screen name="addProfileData" options={{ headerShown: false }} />
            <Stack.Screen name="interests" options={{ headerShown: false }} />
            <Stack.Screen name="password" options={{ headerShown: false }} />
        </Stack>
    );
}
