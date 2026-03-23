import { Stack } from "expo-router";
import { useRef } from "react";

export default function LoginLayout() {
    const renderCount = useRef(0);
    renderCount.current++;
    console.log(`Login layout rendered: ${renderCount.current} times`);

    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="withEmail" options={{ headerShown: false }} />
            <Stack.Screen name="withPhoneNumber" options={{ headerShown: false }} />
        </Stack>
    );
}
