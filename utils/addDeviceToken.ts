import { registerDeviceToken } from "@/services/notifications";

export async function addDeviceToken<T>(token: T): Promise<void> {
    await registerDeviceToken(token);
}
