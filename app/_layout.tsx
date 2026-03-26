import { Slot } from "expo-router";
import BaseTheme from "@/providers/baseTheme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeAreaWrapper from "@/components/SafeArea";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                await new Promise((resolve) => setTimeout(resolve, 500));
            } finally {
                setAppIsReady(true);
            }
        }

        prepare();
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) return null;

    return (
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <BaseTheme>
                <SafeAreaProvider>
                    <SafeAreaWrapper>
                        <Slot />
                    </SafeAreaWrapper>
                </SafeAreaProvider>
            </BaseTheme>
        </View>
    );
}
