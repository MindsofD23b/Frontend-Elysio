export async function initDeviceToken(
    apiBaseUrl: string,
    token: string,
    authToken: string,
): Promise<void> {
    const res = await fetch(`${apiBaseUrl}/notifications/device-token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ deviceToken: token }),
    });

    if (!res.ok) {
        throw new Error("Public key upload failed");
    }
}
