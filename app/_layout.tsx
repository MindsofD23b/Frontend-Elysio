import { Slot, Stack } from "expo-router";
import BaseTheme from "@/providers/baseTheme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeAreaWrapper from "@/components/SafeArea";
import { AuthProvider, useAuth } from "@/lib/auth/AuthProvider";
import { useEffect, useMemo, useRef, useState } from "react";
import { View, LogBox, Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useCacheFetch } from "@/hooks/useCacheFetch";
import { minToMs } from "@/utils/formatTime";
import * as Sentry from "@sentry/react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { initCrypto } from "@/services/chat-crypto.client";
import OutageScreen from "@/app/(auth)/outage";
import UpdateScreen from "@/app/(auth)/update";
import { ServerStatusProvider, useServerStatus } from "@/lib/ServerStatusContext";
// import NoInternetScreen from "@/app/(auth)/no-internet";
// import * as Network from "expo-network";

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

const SERVER_URL = "https://elysio.jamiepoeffel.ch";

SplashScreen.preventAutoHideAsync().catch(() => {});

function AppContent() {
    const [appIsReady, setAppIsReady] = useState(false);
    const [updateDuration, setUpdateDuration] = useState<string | undefined>(undefined);
    const { isLoading, token } = useAuth();
    const serverStatus = useServerStatus();
    const purchasesConfigured = useRef(false);
    // const [isConnected, setIsConnected] = useState<boolean>(true);

    const chatRequest = useMemo<RequestInit>(() => ({ method: "GET" }), []);
    const [, , cache] = useCacheFetch("/chat/rooms", chatRequest, {
        cacheKey: "chat:rooms",
        useCache: true,
        ttlMs: minToMs(10),
    });

    // useEffect(() => {
    //     const subscription = Network.addNetworkStateListener((state) => {
    //         setIsConnected(state.isConnected ?? true);
    //     });
    //     return () => subscription.remove();
    // }, []);

    async function getCustomerInfo() {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
            console.log("Customer Info:", customerInfo);
        } catch (error) {
            console.error("Error fetching customer info:", error);
        }
    }

    async function getOfferings() {
        try {
            const offerings = await Purchases.getOfferings();
            if (
                offerings.current !== null &&
                offerings.current.availablePackages.length !== 0
            ) {
                console.log("Offerings:", JSON.stringify(offerings, null, 2));
            }
        } catch (error) {
            console.error("Error fetching offerings:", error);
        }
    }

    useEffect(() => {
        if (isLoading || serverStatus !== "ok") return;

        if (!purchasesConfigured.current && !Purchases.isConfigured) {
            Purchases.setLogLevel(LOG_LEVEL.DEBUG);
            const key =
                Platform.OS === "ios"
                    ? process.env.PURCHASES_IOS_KEY || "test_aXuDLwLyBHRtkxHFImAdpWwufVT"
                    : process.env.PURCHASES_ANDROID_KEY ||
                      "test_aXuDLwLyBHRtkxHFImAdpWwufVT";
            Purchases.configure({ apiKey: key });
            purchasesConfigured.current = true;
        }

        getCustomerInfo();
        getOfferings();

        async function prepare() {
            try {
                if (token) {
                    await initCrypto(SERVER_URL, token);
                    await cache();
                }
            } catch {
            } finally {
                setAppIsReady(true);
            }
        }

        prepare();
    }, [isLoading, serverStatus]);

    useEffect(() => {
        if (appIsReady) {
            SplashScreen.hideAsync().catch(() => {});
        }
    }, [appIsReady]);

    // if (!isConnected) return <NoInternetScreen />;
    if (serverStatus === "pending") return null;
    if (serverStatus === "down") return <OutageScreen />;
    if (serverStatus === "update") return <UpdateScreen duration={updateDuration} />;
    if (!appIsReady || isLoading) return null;

    return (
        <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen
                    name="datePickerModal"
                    options={{
                        headerShown: false,
                        presentation: "formSheet",
                        gestureEnabled: true,
                        sheetGrabberVisible: true,
                        sheetAllowedDetents: [0.5, 1],
                        sheetInitialDetentIndex: 0,
                    }}
                />
            </Stack>
        </View>
    );
}

export default Sentry.wrap(function RootLayout() {
    return (
        <ServerStatusProvider>
            <AuthProvider>
                <BaseTheme>
                    <SafeAreaProvider>
                        <SafeAreaWrapper>
                            <AppContent />
                        </SafeAreaWrapper>
                    </SafeAreaProvider>
                </BaseTheme>
            </AuthProvider>
        </ServerStatusProvider>
    );
});
