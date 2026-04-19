import { useCallback, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getAppleCredential } from "@/lib/auth/auth.apple";
import { Platform } from "react-native";

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "https://elysio.jamiepoeffel.ch";

export function useAppleAuth() {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const signInWithApple = useCallback(async () => {
        if (Platform.OS !== "ios") return;

        setLoading(true);
        setError(null);

        try {
            const credential = await getAppleCredential();

            if (!credential.identityToken) {
                throw new Error(
                    "Apple did not return an identity token. Please try again.",
                );
            }

            // Save fullName now — Apple won't send it again after first login
            const fullName = credential.fullName
                ? `${credential.fullName.givenName ?? ""} ${credential.fullName.familyName ?? ""}`.trim()
                : null;
            const response = await fetch(`${BASE_URL}/auth/apple`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    identityToken: credential.identityToken,
                    fullName,
                }),
            });

            const text = await response.text();
            console.log("Status:", response.status);
            console.log("Response:", text);

            const json = text ? JSON.parse(text) : null;

            if (!response.ok) {
                throw new Error(
                    Array.isArray(json?.message)
                        ? json.message.join(", ")
                        : json?.message || "Apple sign-in failed",
                );
            }

            await login(json.token);
        } catch (err: any) {
            if (err.code === "ERR_REQUEST_CANCELED") return;
            const finalError = err instanceof Error ? err : new Error("Unknown error");
            setError(finalError);
            throw finalError;
        } finally {
            setLoading(false);
        }
    }, [login]);

    return { signInWithApple, loading, error };
}
