import { Redirect, Stack } from "expo-router";
import BaseTheme from "./baseTheme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeAreaWrapper from "@/components/SafeArea";

const isLoggedIn = false;

export default function RootLayout() {
    if (!isLoggedIn) {
        return (
            <BaseTheme>
                <SafeAreaProvider>
                    <SafeAreaWrapper>
                        <Stack>
                            <Stack.Screen
                                name="(auth)"
                                options={{ headerShown: false }}
                            />
                            <Redirect href="/login" />;
                        </Stack>
                    </SafeAreaWrapper>
                </SafeAreaProvider>
            </BaseTheme>
        );
    }

    return (
        <BaseTheme>
            <SafeAreaProvider>
                <SafeAreaWrapper>
                    <Stack>
                        <Stack.Screen
                            name="(protected)"
                            options={{ headerShown: false }}
                        />
                    </Stack>
                </SafeAreaWrapper>
            </SafeAreaProvider>
        </BaseTheme>
    );
}
