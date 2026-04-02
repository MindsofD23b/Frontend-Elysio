import { Redirect } from "expo-router";
import { sendTestNotification } from "@/hooks/usePushNotifications";
import { useEffect, useState } from "react";

export default function Onboarding() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function sendTest() {
            try {
                await sendTestNotification();
            } finally {
                setLoading(false);
            }
        }
        sendTest();
    }, []);

    if (loading) {
        return null;
    }

    return (
        <>
            <Redirect href="/(protected)/(tabs)" />
        </>
    );
}
