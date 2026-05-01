import { useTheme } from "@/lib/theme/context";
import BackWrapper from "@/components/backwrapper";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BtnText, Button, Loader } from "@/components/button";
import { useState } from "react";
import { router } from "expo-router";
import { useCompleteProfileStore } from "@/utils/completeProfileStore";
import { useAuth } from "@/lib/auth/AuthProvider";

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "https://elysio.jamiepoeffel.ch";

export default function CompleteProfileTerms() {
    const { gs, theme } = useTheme();
    const { token, refreshUser } = useAuth();
    const { data, reset } = useCompleteProfileStore();

    const [terms, setTerms] = useState(data.acceptedTerms);
    const [privacy, setPrivacy] = useState(data.acceptedPrivacyPolicy);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async () => {
        if (!terms || !privacy) {
            setError("You must accept both to continue.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };

            // 1. Patch all profile fields
            const profileBody: Record<string, unknown> = {
                firstName: data.firstName,
                lastName: data.lastName,
                gender: data.gender,
                interestedIn: data.interestedIn,
                minPreferredAge: data.minPreferredAge,
                maxPreferredAge: data.maxPreferredAge,
                dateOfBirth: data.dateOfBirth,
                country: data.country,
                language: data.language,
                jobTitle: data.jobTitle,
                aboutMe: data.aboutMe,
                city: data.city || undefined,
                phonePrefix: data.phonePrefix || undefined,
                phoneNumber: data.phoneNumber || undefined,
                acceptedTerms: true,
                acceptedPrivacyPolicy: true,
            };

            let profileRes = await fetch(`${BASE_URL}/users/me`, {
                method: "PATCH",
                headers,
                body: JSON.stringify(profileBody),
            });

            // If phone number is taken by another account, retry without it
            if (!profileRes.ok) {
                const json = await profileRes.json().catch(() => ({}));
                const msg: string = json?.message ?? "";
                if (
                    profileRes.status === 400 &&
                    msg.toLowerCase().includes("phone number")
                ) {
                    delete profileBody.phonePrefix;
                    delete profileBody.phoneNumber;
                    profileRes = await fetch(`${BASE_URL}/users/me`, {
                        method: "PATCH",
                        headers,
                        body: JSON.stringify(profileBody),
                    });
                    if (!profileRes.ok) {
                        const j2 = await profileRes.json().catch(() => ({}));
                        throw new Error(j2?.message || "Failed to save profile.");
                    }
                } else {
                    throw new Error(msg || "Failed to save profile.");
                }
            }

            // 2. Update interests
            if (data.interests.length > 0) {
                await fetch(`${BASE_URL}/users/me/interests`, {
                    method: "PUT",
                    headers,
                    body: JSON.stringify({ interestIds: data.interests }),
                });
            }

            // 3. Upload profile picture if selected
            if (data.profilePictureUri) {
                const uri = data.profilePictureUri;
                const ext = uri.split(".").pop()?.split("?")[0] ?? "jpg";
                const mimeType = ext === "png" ? "image/png" : "image/jpeg";
                const formData = new FormData();
                formData.append("file", {
                    uri,
                    name: `profile.${ext}`,
                    type: mimeType,
                } as any);

                await fetch(`${BASE_URL}/users/me/photo`, {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });
            }

            // 4. Refresh user so profileComplete becomes true → routing handles redirect
            await refreshUser();
            reset();
        } catch (err: any) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const Checkbox = ({
        checked,
        onToggle,
        label,
    }: {
        checked: boolean;
        onToggle: () => void;
        label: string;
    }) => (
        <Pressable onPress={onToggle} style={styles.checkRow}>
            <View
                style={[
                    styles.checkbox,
                    {
                        borderColor: theme.primary,
                        backgroundColor: checked ? theme.primary : "transparent",
                    },
                ]}
            />
            <Text style={{ color: theme.text, flex: 1 }}>{label}</Text>
        </Pressable>
    );

    return (
        <BackWrapper>
            <ScrollView
                style={{ flex: 1, width: "100%" }}
                contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            >
                <Text style={[gs.h1, { marginTop: 35 }]}>Almost done!</Text>
                <Text style={[gs.bodyText, { marginTop: 10, color: theme.base + "54" }]}>
                    Please accept our terms to complete your profile.
                </Text>

                <View style={{ marginTop: 40, gap: 8 }}>
                    <Checkbox
                        checked={terms}
                        onToggle={() => {
                            setTerms((p) => !p);
                            setError(null);
                        }}
                        label="I accept the Terms of Service"
                    />
                    <Checkbox
                        checked={privacy}
                        onToggle={() => {
                            setPrivacy((p) => !p);
                            setError(null);
                        }}
                        label="I accept the Privacy Policy"
                    />
                </View>

                {error && <Text style={styles.error}>{error}</Text>}

                <Button
                    onPress={onSubmit}
                    style={{ marginTop: "auto" }}
                    disabled={loading || !terms || !privacy}
                >
                    {loading ? <Loader /> : <BtnText>Complete profile</BtnText>}
                </Button>
            </ScrollView>
        </BackWrapper>
    );
}

const styles = StyleSheet.create({
    checkRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
    checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5 },
    error: { color: "red", fontSize: 12, marginTop: 16 },
});
