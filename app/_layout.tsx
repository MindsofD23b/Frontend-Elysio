import { Stack, useRouter } from "expo-router";
import BaseTheme from "@/providers/baseTheme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeAreaWrapper from "@/components/SafeArea";
import { useState, useEffect, useCallback } from "react";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";

const isLoggedIn = false;
const screenOptions = { headerShown: false };

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
    duration: 500,
    fade: true,
});

export default function RootLayout() {
    const [appIsReady, setAppIsReady] = useState<boolean>(false);
    const [navigationReady, setNavigationReady] = useState<boolean>(false);
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
            router.replace("/(auth)/login");
        }
        setNavigationReady(true);
    }, [appIsReady]);

    const onLayoutRootView = useCallback(() => {
        if (appIsReady) {
            SplashScreen.hide();
        }
    }, [appIsReady]);

    if (!appIsReady || !navigationReady) {
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