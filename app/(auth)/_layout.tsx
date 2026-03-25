import { Stack } from "expo-router";

const screenOptions = { headerShown: false };

export default function RootLayout() {
    return (
        <Stack screenOptions={screenOptions}>
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
        </Stack>
    );
}
