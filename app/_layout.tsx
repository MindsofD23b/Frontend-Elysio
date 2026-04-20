import { Slot } from "expo-router";
import BaseTheme from "@/providers/baseTheme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeAreaWrapper from "@/components/SafeArea";
import { AuthProvider, useAuth } from "@/lib/auth/AuthProvider";
import { useEffect, useMemo, useState } from "react";
import { View, LogBox, Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useCacheFetch } from "@/hooks/useCacheFetch";
import { minToMs } from "@/utils/formatTime";
import * as Sentry from "@sentry/react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

LogBox.ignoreAllLogs();

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
    const [appIsReady, setAppIsReady] = useState(false);
    const { isLoading, token } = useAuth();
    const chatRequest = useMemo<RequestInit>(() => ({ method: "GET" }), []);
    const [, , cache] = useCacheFetch("/chat/rooms", chatRequest, {
        cacheKey: "chat:rooms",
        useCache: true,
        ttlMs: minToMs(10),
    });

    async function getCustomerInfo() {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
            console.log("Customer Info:", customerInfo);
        } catch (error) {
            console.error("Error fetching customer info:", error);
        }
    }

    async function getOfferings() {
        const offerings = await Purchases.getOfferings();

        if (
            offerings.current !== null &&
            offerings.current.availablePackages.length !== 0
        ) {
            console.log("Offerings:", JSON.stringify(offerings, null, 2));
        }
    }

    useEffect(() => {
        if (isLoading) return;

        Purchases.setLogLevel(LOG_LEVEL.DEBUG);

        if (Platform.OS === "ios") {
            Purchases.configure({
                apiKey: "appl_HHPNNqzuCyRKMvuLLtZFloXfaIA",
            });
        } else if (Platform.OS === "android") {
            Purchases.configure({
                apiKey: "appl_9c8b1cbdcbb849d0a1e7cdd7f",
            });
        }

        getCustomerInfo();
        getOfferings();

        async function prepare() {
            try {
                if (token) await cache();
            } catch {
            } finally {
                setAppIsReady(true);
            }
        }
        prepare();
    }, [isLoading, token]);

    useEffect(() => {
        if (appIsReady) {
            SplashScreen.hideAsync().catch(() => {});
        }
    }, [appIsReady]);

    if (!appIsReady || isLoading) return null;

    return (
        <View style={{ flex: 1 }}>
            <Slot />
        </View>
    );
}

export default Sentry.wrap(function RootLayout() {
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
});
