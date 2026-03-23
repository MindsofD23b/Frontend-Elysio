import { Stack } from "expo-router";
import { useRef } from "react";

const screenOptions = { headerShown: false };

export default function RegisterLayout() {
    const renderCount = useRef(0);
    renderCount.current++;
    console.log(`Register layout rendered: ${renderCount.current} times`);

    return (
        <Stack screenOptions={screenOptions}>
            <Stack.Screen name="index" />
            <Stack.Screen name="withEmail" />
            <Stack.Screen name="sendVerificationEmail" />
            <Stack.Screen name="gender" />
            <Stack.Screen name="addProfilePicture" />
            <Stack.Screen name="addProfileData" />
            <Stack.Screen name="interests" />
            <Stack.Screen name="password" />
        </Stack>
    );
}
