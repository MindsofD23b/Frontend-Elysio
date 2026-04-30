import { useCallback, useEffect, useState } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { useAuth } from "@/lib/auth/AuthProvider";

WebBrowser.maybeCompleteAuthSession();

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "https://elysio.jamiepoeffel.ch";

const googleConfig = (Constants.expoConfig?.extra?.google ?? {}) as {
    iosClientId?: string;
    androidClientId?: string;
    webClientId?: string;
};

export function useGoogleAuth() {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: googleConfig.iosClientId,
        androidClientId: googleConfig.androidClientId,
        webClientId: googleConfig.webClientId,
        scopes: ["openid", "profile", "email"],
    });

    useEffect(() => {
        if (response?.type !== "success") return;

        const idToken = (response.params as any).id_token;
        if (!idToken) {
            setError(new Error("Google did not return an ID token."));
            return;
        }

        setLoading(true);
        setError(null);

        fetch(`${BASE_URL}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
        })
            .then(async (res) => {
                const json = await res.json();
                if (!res.ok) {
                    throw new Error(
                        Array.isArray(json?.message)
                            ? json.message.join(", ")
                            : json?.message || "Google sign-in failed",
                    );
                }
                return login(json.token);
            })
            .catch((err) => {
                setError(err instanceof Error ? err : new Error("Unknown error"));
            })
            .finally(() => setLoading(false));
    }, [response, login]);

    const signInWithGoogle = useCallback(async () => {
        setError(null);
        await promptAsync();
    }, [promptAsync]);

    return { signInWithGoogle, loading, error, ready: !!request };
}
