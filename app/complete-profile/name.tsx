import BackWrapper from "@/components/backwrapper";
import { useTheme } from "@/lib/theme/context";
import { BtnText, Button } from "@/components/button";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Input from "@/components/input";
import { useCompleteProfileStore } from "@/utils/completeProfileStore";

export default function CompleteProfileName() {
    const { gs, theme } = useTheme();
    const { data, setPersonalDetails } = useCompleteProfileStore();

    const [firstName, setFirstName] = useState(data.firstName);
    const [lastName, setLastName] = useState(data.lastName);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = () => {
        if (!firstName.trim() || !lastName.trim()) {
            setError("Please enter your first and last name.");
            return;
        }
        setPersonalDetails({ firstName: firstName.trim(), lastName: lastName.trim() });
        router.push("/complete-profile/gender");
    };

    const inputStyle = {
        height: 52,
        borderWidth: 0,
        borderRadius: 18,
        paddingHorizontal: 16,
        fontSize: 15,
        backgroundColor: theme.card,
    } as const;

    return (
        <BackWrapper>
            <Text style={[gs.h1, { marginTop: 35 }]}>What&apos;s your name?</Text>
            <Text style={[gs.bodyText, { marginTop: 10, color: theme.base + "54" }]}>
                Tell us your <Text style={{ fontWeight: "bold" }}>real name</Text> so
                others can find you.
            </Text>

            <View style={styles.form}>
                <View>
                    <Text style={[styles.label, { color: theme.primary }]}>
                        First name
                    </Text>
                    <Input
                        placeholder="Anna"
                        value={firstName}
                        onChangeText={(v) => {
                            setFirstName(v);
                            setError(null);
                        }}
                        autoCapitalize="words"
                        style={inputStyle}
                    />
                </View>
                <View>
                    <Text style={[styles.label, { color: theme.primary }]}>
                        Last name
                    </Text>
                    <Input
                        placeholder="Müller"
                        value={lastName}
                        onChangeText={(v) => {
                            setLastName(v);
                            setError(null);
                        }}
                        autoCapitalize="words"
                        style={inputStyle}
                    />
                </View>
                {error && <Text style={styles.error}>{error}</Text>}
            </View>

            <Button
                style={{ marginTop: "auto" }}
                onPress={onSubmit}
                disabled={!firstName.trim() || !lastName.trim()}
            >
                <BtnText>Continue</BtnText>
            </Button>
        </BackWrapper>
    );
}

const styles = StyleSheet.create({
    form: { marginTop: 32, gap: 16, width: "100%" },
    label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
    error: { color: "red", fontSize: 12, marginTop: 4 },
});
