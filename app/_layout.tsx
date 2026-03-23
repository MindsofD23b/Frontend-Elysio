import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import BaseTheme from "@/providers/baseTheme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeAreaWrapper from "@/components/SafeArea";
import { useState, useEffect, useCallback } from "react";
import { View } from "react-native";

const isLoggedIn = false;
const screenOptions = { headerShown: false };

export default function RootLayout() {
    const [appIsReady, setAppIsReady] = useState<boolean>(false);
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        async function prepare() {
            try {
                await new Promise((resolve) => setTimeout(resolve, 2000));
            } catch (err) {
                console.warn(err);
            } finally {
                setAppIsReady(true);
            }
        }
        prepare();
    }, []);

    useEffect(() => {
        if (!appIsReady) return;
        if (!isLoggedIn) {
            router.push("/(auth)/login");
        }
    }, [appIsReady, isLoggedIn]);

    const onLayoutRootView = useCallback(() => {
        if (appIsReady) {
            SplashScreen.hide();
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return null;
    }

    return (
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <BaseTheme>
                <SafeAreaProvider>
                    <SafeAreaWrapper>
                        <Stack screenOptions={screenOptions}>
                            <Stack.Screen name="(auth)" />
                            <Stack.Screen name="(protected)" />
                        </Stack>
                    </SafeAreaWrapper>
                </SafeAreaProvider>
            </BaseTheme>
        </View>
    );
}
