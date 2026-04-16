import { Slot } from "expo-router";
import BaseTheme from "@/providers/baseTheme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeAreaWrapper from "@/components/SafeArea";
import { AuthProvider, useAuth } from "@/lib/auth/AuthProvider";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
SplashScreen.preventAutoHideAsync().catch(() => {});

function AppContent() {
    const [appIsReady, setAppIsReady] = useState(false);
    const { isLoading } = useAuth();

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

    if (!appIsReady || isLoading) return null;

    return (
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <Slot />
        </View>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <BaseTheme>
                <SafeAreaProvider>
                    <SafeAreaWrapper>
                        <AppContent />
                    </SafeAreaWrapper>
                </SafeAreaProvider>
            </BaseTheme>
        </AuthProvider>
    );
}
