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
                    <Stack>
                        <Stack.Screen
                            name="(protected)"
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen name="auth" options={{ headerShown: false }} />
                    </Stack>

                    {!isLoggedIn && <Redirect href="/auth/login" />}
                </SafeAreaWrapper>
            </SafeAreaProvider>
        </BaseTheme>
    );
}
