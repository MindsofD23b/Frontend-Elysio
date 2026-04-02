import { useState, useEffect, useRef, useCallback } from "react";

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { type EventSubscription } from "expo-modules-core";

import Constants from "expo-constants";

import { Platform } from "react-native";
import { useTheme } from "@/lib/theme/context";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export interface PushNotificationState {
    notification?: Notifications.Notification;
    expoPushToken?: Notifications.ExpoPushToken;
    sendTestNotification: () => Promise<void>;
}

export async function sendTestNotification(): Promise<void> {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Test Notification",
            body: "Push notifications are working!",
            data: { test: true },
        },
        trigger: null,
    });
}

export const usePushNotifications = (): PushNotificationState => {
    const { theme } = useTheme();

    const [expoPushToken, setExpoPushToken] = useState<
        Notifications.ExpoPushToken | undefined
    >();
    const [notification, setNotification] = useState<
        Notifications.Notification | undefined
    >();

    const notificationListener = useRef<EventSubscription | null>(null);
    const responseListener = useRef<EventSubscription | null>(null);

    const registerForPushNotificationsAsync = useCallback(async () => {
        if (!Device.isDevice) {
            console.log("[ERROR] Must use physical device for Push Notifications");
            return;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== "granted") {
            alert("[ERROR] Failed to get push token for push notification!");
            return;
        }

        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: theme.primary,
            });
        }

        const token = await Notifications.getExpoPushTokenAsync({
            projectId:
                Constants.expoConfig?.extra?.eas?.projectId ??
                Constants.easConfig?.projectId,
        });

        return token;
    }, [theme.primary]);

    useEffect(() => {
        registerForPushNotificationsAsync().then((token) => setExpoPushToken(token));

        notificationListener.current = Notifications.addNotificationReceivedListener(
            (notification: Notifications.Notification) => {
                setNotification(notification);
            },
        );

        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            (response: Notifications.NotificationResponse) => {
                console.log(response);
            },
        );

        return () => {
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, [registerForPushNotificationsAsync]);

    return { expoPushToken, notification, sendTestNotification };
};
