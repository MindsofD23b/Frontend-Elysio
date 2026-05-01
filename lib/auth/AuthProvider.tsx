import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { get } from "@/utils/store";
import { initDeviceToken } from "@/services/notifications";

export type UserProfile = {
    id: string;
    email: string | null;
    firstName: string;
    lastName: string;
    gender: string;
    interestedIn: string | null;
    minPreferredAge: number | null;
    maxPreferredAge: number | null;
    dateOfBirth: Date | null;
    country: string;
    language: string;
    jobTitle: string;
    aboutMe: string;
    city: string | null;
    phoneNumber: string | null;
    phonePrefix: string | null;
    emailVerified: boolean;
    acceptedTerms: boolean;
    acceptedPrivacyPolicy: boolean;
    subscriptionStatus: string;
    photoUrl?: string | null;
};

type AuthContextType = {
    token: string | null;
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    profileComplete: boolean;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const BASE_URL = "https://elysio.jamiepoeffel.ch";
const TOKEN_KEY = "token";

function checkProfileComplete(user: UserProfile | null): boolean {
    if (!user) return false;
    return !!(
        user.firstName?.trim() &&
        user.lastName?.trim() &&
        user.gender?.trim() &&
        user.interestedIn?.trim() &&
        user.dateOfBirth &&
        user.country?.trim() &&
        user.language?.trim() &&
        user.jobTitle?.trim() &&
        user.aboutMe?.trim() &&
        user.acceptedTerms &&
        user.acceptedPrivacyPolicy
    );
}

async function fetchUserProfile(token: string): Promise<UserProfile | null> {
    try {
        const res = await fetch(`${BASE_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const hydrateAuth = async () => {
            try {
                const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
                if (storedToken) {
                    setToken(storedToken);
                    const profile = await fetchUserProfile(storedToken);
                    setUser(profile);
                }
            } catch (error) {
                console.error("Failed to load auth token", error);
                setToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        hydrateAuth();
    }, []);

    const refreshUser = useCallback(async () => {
        if (!token) return;
        const profile = await fetchUserProfile(token);
        setUser(profile);
    }, [token]);

    const login = async (nextToken: string) => {
        setToken(nextToken);
        await AsyncStorage.setItem(TOKEN_KEY, nextToken);

        const profile = await fetchUserProfile(nextToken);
        setUser(profile);

        console.log("Calling initCrypto...");
        await initCrypto(BASE_URL, nextToken);
        console.log("initCrypto done");

        console.log("Calling initDeviceToken...");
        const pushToken: string | null = await get("expo-push-token");
        if (pushToken) {
            await initDeviceToken(BASE_URL, pushToken, nextToken);
        }
        console.log("initDeviceToken done");
    };

    const logout = async () => {
        await AsyncStorage.clear();
        setToken(null);
        setUser(null);
    };

    const profileComplete = checkProfileComplete(user);

    const value = useMemo(
        () => ({
            token,
            user,
            isAuthenticated: !!token,
            isLoading,
            profileComplete,
            login,
            logout,
            refreshUser,
        }),
        [token, user, isLoading, profileComplete, refreshUser],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
}
