import { get_token } from "@/hooks/useStore";

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "https://elysio.jamiepoeffel.ch";

export async function api<T = unknown>(
    route: string,
    requestInit: RequestInit = {},
): Promise<T> {
    const token = get_token();

    console.log(token);

    const response = await fetch(`${BASE_URL}${route}`, {
        ...requestInit,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token ?? ""}`,
            ...(requestInit.headers || {}),
        },
    });

    const text = await response.text();
    const json = text ? JSON.parse(text) : null;

    if (!response.ok) {
        throw new Error(
            Array.isArray(json?.message)
                ? json.message.join(", ")
                : json?.message || "Request failed",
        );
    }

    return json as T;
}
