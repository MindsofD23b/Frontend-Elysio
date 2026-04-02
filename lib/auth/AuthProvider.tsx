import { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initCrypto } from "@/services/chat-crypto.client";

type AuthContextType = {
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const hydrateAuth = async () => {
            try {
                const storedToken = await AsyncStorage.getItem("token");
                setToken(storedToken);

                if (storedToken) {
                    await initCrypto("https://elysio.jamiepoeffel.ch", storedToken);
                }
            } catch (error) {
                console.error("Failed to load auth token", error);
                setToken(null);
            } finally {
                setIsLoading(false);
            }
        };

        hydrateAuth();
    }, []);

    const login = async (nextToken: string) => {
        setToken(nextToken);
        await AsyncStorage.setItem("token", nextToken);
        console.log("Calling initCrypto..."); // ← neu
        await initCrypto("https://elysio.jamiepoeffel.ch", nextToken);
        console.log("initCrypto done"); // ← neu
    };

    const logout = async () => {
        await AsyncStorage.clear();
        setToken(null);
    };

    const value = useMemo(
        () => ({
            token,
            isAuthenticated: !!token,
            isLoading,
            login,
            logout,
        }),
        [token, isLoading],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}
