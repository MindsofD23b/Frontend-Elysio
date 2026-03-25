import { Redirect, Stack } from "expo-router";
import BaseTheme from "./baseTheme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeAreaWrapper from "@/components/SafeArea";

const isLoggedIn = true;

export default function RootLayout() {
    return (
        <BaseTheme>
            <SafeAreaProvider>
                <SafeAreaWrapper>
                    {!isLoggedIn ? (
                        <Redirect href="/(auth)/login" />
                    ) : (
                        <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="(protected)" />
                        </Stack>
                    )}
                </SafeAreaWrapper>
            </SafeAreaProvider>
        </BaseTheme>
    );
}