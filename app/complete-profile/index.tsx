import { useEffect } from "react";
import { router } from "expo-router";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useCompleteProfileStore } from "@/utils/completeProfileStore";
import { ActivityIndicator, View } from "react-native";

export default function CompleteProfileIndex() {
    const { user } = useAuth();
    const { seed } = useCompleteProfileStore();

    useEffect(() => {
        if (!user) return;

        // Pre-fill anything we already have from Apple/Google
        seed({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            gender: (user.gender as any) || "",
            interestedIn: (user.interestedIn as any) || "",
            minPreferredAge: user.minPreferredAge ?? 18,
            maxPreferredAge: user.maxPreferredAge ?? 35,
            country: user.country || "CH",
            language: user.language || "en",
            jobTitle: user.jobTitle || "",
            aboutMe: user.aboutMe || "",
            city: user.city || "",
            phonePrefix: user.phonePrefix || "",
            phoneNumber: user.phoneNumber || "",
            acceptedTerms: user.acceptedTerms,
            acceptedPrivacyPolicy: user.acceptedPrivacyPolicy,
        });

        // Navigate to the first step that still needs attention
        if (!user.firstName?.trim() || !user.lastName?.trim()) {
            router.replace("/complete-profile/name");
        } else {
            router.replace("/complete-profile/gender");
        }
    }, [user]);

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator />
        </View>
    );
}
