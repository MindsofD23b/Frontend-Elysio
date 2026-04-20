import { Slot } from "expo-router";
import BaseTheme from "@/providers/baseTheme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeAreaWrapper from "@/components/SafeArea";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import * as Sentry from "@sentry/react-native";

Sentry.init({
    dsn: "https://4661a597143882ddcad75b48f4e69f4d@o4511231190761472.ingest.de.sentry.io/4511231191810128",

    // Adds more context data to events (IP address, cookies, user, etc.)
    // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
    sendDefaultPii: true,

    // Enable Logs
    enableLogs: true,

    // Configure Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

    // uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: __DEV__,
});

SplashScreen.preventAutoHideAsync().catch(() => {});

function AppContent() {
    return <Slot />;
}

export default Sentry.wrap(function RootLayout() {
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
            <AuthProvider>
                <BaseTheme>
                    <SafeAreaProvider>
                        <SafeAreaWrapper>
                            <AppContent />
                        </SafeAreaWrapper>
                    </SafeAreaProvider>
                </BaseTheme>
            </AuthProvider>
        </View>
    );
});
