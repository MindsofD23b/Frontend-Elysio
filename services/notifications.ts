import { api } from "@/utils/api";

export async function registerDeviceToken<T>(token: T): Promise<void> {
    await api("/notifications/device-token", {
        method: "POST",
        body: JSON.stringify({ deviceToken: token }),
    });
}
